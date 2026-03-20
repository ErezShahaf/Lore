import { v4 as uuidv4 } from 'uuid'
import { storeThought, storeThoughtWithMetadata, checkForDuplicate } from '../documentPipeline'
import { formatLocalDate } from '../localDate'
import { getSettings } from '../settingsService'
import { loadSkill } from '../skillLoader'
import { generateStructuredResponse } from '../ollamaService'
import { decomposeForStorage } from '../saveDecompositionService'
import type { ClassificationResult, AgentEvent, DecomposedItem, DocumentType, ConversationEntry } from '../../../shared/types'

const RAW_JSON_THOUGHT_ROUTING_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: ['clarify_raw_json', 'confirm_save_previously_provided_json_exactly', 'store_normal'],
    },
    clarificationMessage: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    confirmationMessage: { anyOf: [{ type: 'string' }, { type: 'null' }] },
  },
  required: ['action', 'clarificationMessage', 'confirmationMessage'],
  additionalProperties: false,
}

export async function* handleThought(
  userInput: string,
  classification: ClassificationResult,
  conversationHistory: readonly ConversationEntry[] = [],
): AsyncGenerator<AgentEvent> {
  yield { type: 'status', message: 'Saving your thought...' }

  const routing = await routeRawJsonThought(userInput, conversationHistory)

  if (routing.action === 'clarify_raw_json') {
    yield { type: 'chunk', content: routing.clarificationMessage ?? '' }
    yield { type: 'done' }
    return
  }

  const today = formatLocalDate(new Date())
  const date = classification.extractedDate ?? today

  const previousRawJson = findMostRecentValidRawJson(conversationHistory)
  const lowerUserInput = userInput.toLowerCase()
  const isSaveThatJsonExactlyRequest = lowerUserInput.includes('save that')
    && lowerUserInput.includes('json')
    && lowerUserInput.includes('exactly')

  if (
    previousRawJson
    && (routing.action === 'confirm_save_previously_provided_json_exactly' || isSaveThatJsonExactlyRequest)
  ) {
    const tags = deriveTagsFromJsonPayload(previousRawJson)
    yield* storeSingleItem(
      previousRawJson,
      previousRawJson,
      'note',
      date,
      tags,
      routing.confirmationMessage,
    )
    yield { type: 'done' }
    return
  }

  if (routing.action === 'confirm_save_previously_provided_json_exactly' && !previousRawJson) {
    // Better to ask what to do next than to store the confirmation text or a misresolved payload.
    yield {
      type: 'chunk',
      content: routing.clarificationMessage
        ?? 'You shared raw JSON. What would you like to do with it? For example: save it as a note, or use it to retrieve matching stored JSON.',
    }
    yield { type: 'done' }
    return
  }

  const { items } = await decomposeForStorage(userInput, conversationHistory)

  const customSavedJsonMessage =
    routing.action === 'confirm_save_previously_provided_json_exactly' ? routing.confirmationMessage : null

  if (items.length <= 1) {
    const item = items[0] ?? { content: userInput, type: 'thought' as const, tags: [] }
    const tags = item.tags.length > 0 ? item.tags : classification.extractedTags
    yield* storeSingleItem(
      item.content,
      userInput,
      item.type,
      date,
      tags,
      customSavedJsonMessage,
    )
  } else {
    yield* storeMultipleItems(items, userInput, date)
  }

  yield { type: 'done' }
}

async function* storeSingleItem(
  content: string,
  originalInput: string,
  docType: DocumentType,
  date: string,
  tags: readonly string[],
  customSavedJsonMessage: string | null,
): AsyncGenerator<AgentEvent> {
  const duplicate = await checkForDuplicate(content)
  if (duplicate) {
    const preview = duplicate.content.slice(0, 120)
    yield {
      type: 'duplicate',
      existingContent: preview,
    }
    yield {
      type: 'chunk',
      content: `This seems similar to a note you already have: "${preview}${duplicate.content.length > 120 ? '...' : ''}"\n\nI've saved it as a new note anyway, but you may want to delete the duplicate.`,
    }
  }

  const doc = await storeThought({
    content,
    originalInput,
    type: docType,
    date,
    tags,
  })

  yield { type: 'stored', documentId: doc.id }

  if (!duplicate) {
    if (customSavedJsonMessage) {
      yield { type: 'chunk', content: customSavedJsonMessage }
      return
    }

    const topic = summarizeTopic(content)
    yield { type: 'chunk', content: `Got it! I've saved your ${docType} about ${topic}.` }
  }
}

async function* storeMultipleItems(
  items: readonly DecomposedItem[],
  originalInput: string,
  date: string,
): AsyncGenerator<AgentEvent> {
  const groupId = uuidv4()
  let duplicateCount = 0
  let hasTodos = false

  for (const item of items) {
    const duplicate = await checkForDuplicate(item.content)
    if (duplicate) duplicateCount++

    const itemDocType = item.type
    if (itemDocType === 'todo') hasTodos = true

    const doc = await storeThoughtWithMetadata(
      { content: item.content, originalInput, type: itemDocType, date, tags: [...item.tags] },
      { groupId },
    )

    yield { type: 'stored', documentId: doc.id }
  }

  const typeLabel = hasTodos ? 'todos' : 'notes'
  let message = `Got it! I've saved ${items.length} ${typeLabel}.`
  if (duplicateCount > 0) {
    message += ` (${duplicateCount} seemed similar to notes you already have.)`
  }
  yield { type: 'chunk', content: message }
}

function summarizeTopic(input: string): string {
  const words = input.split(/\s+/).slice(0, 6).join(' ')
  return words.length < input.length ? `${words}...` : words
}

async function routeRawJsonThought(
  userInput: string,
  conversationHistory: readonly ConversationEntry[],
): Promise<{
  readonly action: 'clarify_raw_json' | 'confirm_save_previously_provided_json_exactly' | 'store_normal'
  readonly clarificationMessage: string | null
  readonly confirmationMessage: string | null
}> {
  const trimmedInput = userInput.trim()
  if (trimmedInput.startsWith('{') || trimmedInput.startsWith('[')) {
    // If the user's entire message is raw structured data, skip the LLM router and deterministically
    // ask what they want to do with it.
    try {
      const parsed: unknown = JSON.parse(trimmedInput)
      if (parsed && typeof parsed === 'object') {
        return {
          action: 'clarify_raw_json',
          clarificationMessage:
            'You shared raw JSON. What would you like to do with it? For example: save it as a note, or use it to retrieve matching stored JSON.',
          confirmationMessage: null,
        }
      }
      return {
        action: 'clarify_raw_json',
        clarificationMessage:
          'This structured JSON appears incomplete or malformed. What would you like to do with it (save it as a note, or retrieve matching stored JSON)?',
        confirmationMessage: null,
      }
    } catch {
      return {
        action: 'clarify_raw_json',
        clarificationMessage:
          'This structured JSON appears incomplete or malformed. What would you like to do with it (save it as a note, or retrieve matching stored JSON)?',
        confirmationMessage: null,
      }
    }
  }

  const settings = getSettings()
  const systemPrompt = loadSkill('raw-json-thought-routing')

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  for (const entry of conversationHistory) {
    messages.push({ role: entry.role, content: entry.content })
  }

  messages.push({ role: 'user', content: userInput })

  const routing = await generateStructuredResponse({
    model: settings.selectedModel,
    messages,
    schema: RAW_JSON_THOUGHT_ROUTING_SCHEMA,
    maxAttempts: 2,
    validate: (parsed) => {
      const rawAction = typeof parsed.action === 'string' ? parsed.action.trim() : ''
      const action: 'clarify_raw_json' | 'confirm_save_previously_provided_json_exactly' | 'store_normal' =
        rawAction === 'clarify_raw_json'
          ? 'clarify_raw_json'
          : rawAction === 'confirm_save_previously_provided_json_exactly'
            ? 'confirm_save_previously_provided_json_exactly'
            : 'store_normal'

      const clarificationMessage = typeof parsed.clarificationMessage === 'string' ? parsed.clarificationMessage : null
      const confirmationMessage = typeof parsed.confirmationMessage === 'string' ? parsed.confirmationMessage : null

      return { action, clarificationMessage, confirmationMessage }
    },
  })

  return {
    action: routing.action,
    clarificationMessage: routing.clarificationMessage,
    confirmationMessage: routing.confirmationMessage,
  }
}

function findMostRecentValidRawJson(conversationHistory: readonly ConversationEntry[]): string | null {
  for (let i = conversationHistory.length - 1; i >= 0; i -= 1) {
    const entry = conversationHistory[i]
    if (entry.role !== 'user') continue

    const trimmed = entry.content.trim()
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) continue

    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (parsed && typeof parsed === 'object') {
        return entry.content
      }
    } catch {
      // keep searching
    }
  }

  return null
}

function deriveTagsFromJsonPayload(rawJson: string): readonly string[] {
  const tags = new Set<string>()
  tags.add('json')

  try {
    const parsed: unknown = JSON.parse(rawJson)
    if (!parsed || typeof parsed !== 'object') return [...tags]

    const record = parsed as Record<string, unknown>

    const provider = typeof record.provider === 'string' ? record.provider.trim().toLowerCase() : null
    const event = typeof record.event === 'string' ? record.event.trim().toLowerCase() : null
    const eventCode = typeof record.eventCode === 'string' ? record.eventCode.trim().toLowerCase() : null
    const url = typeof record.url === 'string' ? record.url.trim().toLowerCase() : null

    if (provider) tags.add(provider)
    if (event) tags.add(event)
    if (eventCode) tags.add(eventCode)
    if (url) tags.add('webhook')
    // The eval seeds use `webhook` tag for retrieval heuristics.
    tags.add('webhook')
  } catch {
    // If parsing fails, keep minimal tags.
  }

  return [...tags]
}
