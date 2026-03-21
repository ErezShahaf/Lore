import { generateStructuredResponse } from './ollamaService'
import { getSettings } from './settingsService'
import { loadSkill } from './skillLoader'
import { logger } from '../logger'
import type {
  DecomposedDocumentType,
  DecomposedItem,
  SaveDecompositionResult,
  ConversationEntry,
  SaveShapePlan,
} from '../../shared/types'

const DECOMPOSED_DOCUMENT_TYPES = ['thought', 'todo', 'meeting', 'note'] as const

const DECOMPOSITION_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          type: { type: 'string', enum: [...DECOMPOSED_DOCUMENT_TYPES] },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['content', 'type', 'tags'],
      },
    },
  },
  required: ['items'],
  additionalProperties: false,
}

const MAX_RETRIES = 2

export async function decomposeForStorage(
  userInput: string,
  conversationHistory: readonly ConversationEntry[] = [],
  shapePlan?: SaveShapePlan | null,
): Promise<SaveDecompositionResult> {
  const settings = getSettings()
  const systemPrompt = loadSkill('save-items')

  const shapeBlock =
    shapePlan !== undefined && shapePlan !== null
      ? `Shape plan (from upstream agent):\n${JSON.stringify(shapePlan)}\n\n`
      : ''

  const decompositionInput = `${shapeBlock}User message to decompose:\n${userInput}`

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  for (const entry of conversationHistory) {
    messages.push({ role: entry.role, content: entry.content })
  }

  messages.push({ role: 'user', content: decompositionInput })

  try {
    const result = await generateStructuredResponse({
      model: settings.selectedModel,
      messages,
      schema: DECOMPOSITION_SCHEMA,
      maxAttempts: MAX_RETRIES,
      validate: (parsed) => ({ items: validateItems(parsed.items, decompositionInput) }),
    })
    const validatedResult = {
      items: validateItems(result.items, decompositionInput),
    }

    logger.debug(
      { inputLength: userInput.length, itemCount: validatedResult.items.length },
      '[SaveDecomposition] Decomposed input',
    )

    return validatedResult
  } catch (error) {
    logger.error(
      { error },
      '[SaveDecomposition] All attempts failed, falling back to single item',
    )
    return { items: [buildFallbackItem(decompositionInput.trim())] }
  }
}

function validateItems(rawItems: unknown, originalInput: string): DecomposedItem[] {
  const trimmedInput = originalInput.trim()
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return [buildFallbackItem(trimmedInput)]
  }

  const items: DecomposedItem[] = rawItems
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).content === 'string',
    )
    .map((item) => {
      const rawTags = Array.isArray(item.tags)
        ? (item.tags as unknown[]).filter((tag): tag is string => typeof tag === 'string')
        : []
      const type = resolveDocumentType(item.type, originalInput, rawTags)
      const rawContent = (item.content as string).trim()

      return {
        // Preserve the model's literal stored content for all item types.
        content: rawContent,
        type,
        tags: ensureDefaultTags(type, rawTags),
      }
    })
    .filter((item) => item.content.length > 0)

  if (items.length === 0) {
    return [buildFallbackItem(trimmedInput)]
  }

  return items
}

function buildFallbackItem(originalInput: string): DecomposedItem {
  const type = resolveDocumentType(null, originalInput, [])
  return {
    content: originalInput,
    type,
    tags: getDefaultTags(type),
  }
}

function resolveDocumentType(
  rawType: unknown,
  originalInput: string,
  rawTags: readonly unknown[],
): DecomposedDocumentType {
  if (typeof rawType === 'string' && isDecomposedDocumentType(rawType)) {
    return rawType
  }

  const normalizedTags = rawTags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.toLowerCase())

  if (normalizedTags.includes('todo')) {
    return 'todo'
  }

  if (normalizedTags.includes('meeting')) {
    return 'meeting'
  }

  if (normalizedTags.includes('note')) {
    return 'note'
  }

  // If type is missing/invalid, trust the model-produced tags only (no regex intent heuristics).
  return 'thought'
}

function getDefaultTags(type: DecomposedDocumentType): string[] {
  if (type === 'thought') {
    return []
  }

  return [type]
}

function ensureDefaultTags(type: DecomposedDocumentType, tags: readonly string[]): string[] {
  const normalizedTags = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)

  if (normalizedTags.length > 0) {
    return [...new Set(normalizedTags)]
  }

  return getDefaultTags(type)
}

function isDecomposedDocumentType(value: string): value is DecomposedDocumentType {
  return DECOMPOSED_DOCUMENT_TYPES.includes(value as DecomposedDocumentType)
}
