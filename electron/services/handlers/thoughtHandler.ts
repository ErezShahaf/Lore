import { v4 as uuidv4 } from 'uuid'
import { storeThought, storeThoughtWithMetadata, checkForDuplicate } from '../documentPipeline'
import { formatLocalDate } from '../localDate'
import { getSettings } from '../settingsService'
import { loadSkill } from '../skillLoader'
import { generateStructuredResponse } from '../ollamaService'
import { decomposeForStorage } from '../saveDecompositionService'
import { planSaveShape } from '../saveShapeService'
import { appendUserInstructionsToSystemPrompt } from '../userInstructionsContext'
import { streamAssistantUserReplyWithFallback } from '../assistantReplyComposer'
import { logger } from '../../logger'
import type { ClassificationResult, AgentEvent, DecomposedItem, DocumentType, ConversationEntry } from '../../../shared/types'

const RAW_JSON_CLARIFICATION_VALID_MESSAGE =
  'You shared raw JSON. What would you like to do with it? For example: save it as a note, or use it to retrieve matching stored JSON.'

const RAW_JSON_CLARIFICATION_INVALID_MESSAGE =
  'This structured JSON appears incomplete or malformed. What would you like to do with it (save it as a note, or retrieve matching stored JSON)?'

const RAW_JSON_CONFIRMATION_MESSAGE =
  "Got it! I've saved the previously provided JSON exactly as requested."

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
  userInstructionsBlock: string = '',
): AsyncGenerator<AgentEvent> {
  yield { type: 'status', message: 'Checking JSON routing and save path…' }

  const routing = await routeRawJsonThought(userInput, conversationHistory, userInstructionsBlock)

  if (routing.action === 'clarify_raw_json') {
    yield {
      type: 'chunk',
      content: routing.clarificationMessage ?? RAW_JSON_CLARIFICATION_VALID_MESSAGE,
    }
    yield { type: 'done' }
    return
  }

  const today = formatLocalDate(new Date())
  const date = classification.extractedDate ?? today

  const previousRawJson = findMostRecentValidRawJson(conversationHistory)

  if (previousRawJson && routing.action === 'confirm_save_previously_provided_json_exactly') {
    const tags = deriveTagsFromJsonPayload(previousRawJson)
    yield* storeSingleItem(
      previousRawJson,
      previousRawJson,
      'note',
      date,
      tags,
      routing.confirmationMessage ?? RAW_JSON_CONFIRMATION_MESSAGE,
      userInstructionsBlock,
    )
    yield { type: 'done' }
    return
  }

  if (routing.action === 'confirm_save_previously_provided_json_exactly' && !previousRawJson) {
    // Better to ask what to do next than to store the confirmation text or a misresolved payload.
    yield {
      type: 'chunk',
      content: routing.clarificationMessage ?? RAW_JSON_CLARIFICATION_VALID_MESSAGE,
    }
    yield { type: 'done' }
    return
  }

  yield { type: 'status', message: 'Planning how to split your note or todos…' }
  const shapePlan = await planSaveShape(userInput, conversationHistory, userInstructionsBlock)
  yield { type: 'status', message: 'Extracting items to store…' }
  const { items } = await decomposeForStorage(userInput, conversationHistory, shapePlan, userInstructionsBlock)

  const customSavedJsonMessage =
    routing.action === 'confirm_save_previously_provided_json_exactly'
      ? (routing.confirmationMessage ?? RAW_JSON_CONFIRMATION_MESSAGE)
      : null

  if (items.length === 0) {
    logger.warn({ userInput }, '[ThoughtHandler] Decomposition returned no items')
    yield { type: 'chunk', content: 'Nothing to save.' }
    yield { type: 'done' }
    return
  }

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
      userInstructionsBlock,
    )
  } else {
    yield* storeMultipleItems(items, userInput, date, userInstructionsBlock)
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
  userInstructionsBlock: string,
): AsyncGenerator<AgentEvent> {
  const duplicate = await checkForDuplicate(content)
  let duplicatePreviewForFacts: string | null = null
  if (duplicate) {
    const preview = duplicate.content.slice(0, 120)
    duplicatePreviewForFacts =
      `${preview}${duplicate.content.length > 120 ? '...' : ''}`
    yield {
      type: 'duplicate',
      existingContent: preview,
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

  if (customSavedJsonMessage) {
    yield { type: 'chunk', content: customSavedJsonMessage }
    return
  }

  const topic = summarizeTopic(content)
  for await (const chunk of streamAssistantUserReplyWithFallback({
    userInstructionsBlock,
    facts: {
      kind: 'thought_saved_single',
      documentType: docType,
      topicSummary: topic,
      hadDuplicate: duplicate !== null,
      duplicatePreview: duplicatePreviewForFacts,
    },
  })) {
    yield { type: 'chunk', content: chunk }
  }
}

async function* storeMultipleItems(
  items: readonly DecomposedItem[],
  originalInput: string,
  date: string,
  userInstructionsBlock: string,
): AsyncGenerator<AgentEvent> {
  const groupId = uuidv4()
  let duplicateCount = 0
  let hasTodos = false
  let todoItemCount = 0
  const storedThisBatchIds = new Set<string>()

  for (const item of items) {
    const duplicate = await checkForDuplicate(item.content)
    if (duplicate && !storedThisBatchIds.has(duplicate.id)) {
      duplicateCount += 1
    }

    const itemDocType = item.type
    if (itemDocType === 'todo') {
      hasTodos = true
      todoItemCount += 1
    }

    const doc = await storeThoughtWithMetadata(
      { content: item.content, originalInput, type: itemDocType, date, tags: [...item.tags] },
      { groupId },
    )
    storedThisBatchIds.add(doc.id)

    yield { type: 'stored', documentId: doc.id }
  }

  for await (const chunk of streamAssistantUserReplyWithFallback({
    userInstructionsBlock,
    facts: {
      kind: 'thought_saved_many',
      itemCount: items.length,
      todoItemCount,
      hasTodos,
      duplicateCount,
    },
  })) {
    yield { type: 'chunk', content: chunk }
  }
}

function summarizeTopic(input: string): string {
  const words = input.split(/\s+/).slice(0, 6).join(' ')
  return words.length < input.length ? `${words}...` : words
}

async function routeRawJsonThought(
  userInput: string,
  conversationHistory: readonly ConversationEntry[],
  userInstructionsBlock: string,
): Promise<{
  readonly action: 'clarify_raw_json' | 'confirm_save_previously_provided_json_exactly' | 'store_normal'
  readonly clarificationMessage: string | null
  readonly confirmationMessage: string | null
}> {
  const trimmedInput = userInput.trim()
  if (trimmedInput.startsWith('{') || trimmedInput.startsWith('[')) {
    // Entire message is raw structured data: clarify deterministically so behavior does not depend
    // on the router model for JSON-only turns.
    try {
      const parsed: unknown = JSON.parse(trimmedInput)
      if (parsed && typeof parsed === 'object') {
        return {
          action: 'clarify_raw_json',
          clarificationMessage: RAW_JSON_CLARIFICATION_VALID_MESSAGE,
          confirmationMessage: null,
        }
      }
      return {
        action: 'clarify_raw_json',
        clarificationMessage: RAW_JSON_CLARIFICATION_INVALID_MESSAGE,
        confirmationMessage: null,
      }
    } catch {
      return {
        action: 'clarify_raw_json',
        clarificationMessage: RAW_JSON_CLARIFICATION_INVALID_MESSAGE,
        confirmationMessage: null,
      }
    }
  }

  const settings = getSettings()
  const systemPrompt = appendUserInstructionsToSystemPrompt(
    loadSkill('raw-json-thought-routing'),
    userInstructionsBlock,
  )

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
  } catch {
    // If parsing fails, keep minimal tags.
  }

  return [...tags]
}
