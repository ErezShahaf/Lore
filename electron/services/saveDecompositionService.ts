import { chat } from './ollamaService'
import { getSettings } from './settingsService'
import { loadSkill } from './skillLoader'
import { logger } from '../logger'
import type { DecomposedItem, SaveDecompositionResult, ConversationEntry } from '../../shared/types'

const DECOMPOSITION_SCHEMA = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
        },
        required: ['content', 'tags'],
      },
    },
  },
  required: ['items'],
}

const MAX_RETRIES = 2

export async function decomposeForStorage(
  userInput: string,
  conversationHistory: readonly ConversationEntry[] = [],
): Promise<SaveDecompositionResult> {
  const settings = getSettings()
  const systemPrompt = loadSkill('save-decomposition')

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt },
  ]

  for (const entry of conversationHistory) {
    messages.push({ role: entry.role, content: entry.content })
  }

  messages.push({ role: 'user', content: userInput })

  let lastError: unknown

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const stream = chat({
        model: settings.selectedModel,
        messages,
        stream: false,
        format: DECOMPOSITION_SCHEMA,
        think: false,
      })

      let response = ''
      for await (const chunk of stream) {
        response += chunk
      }

      const parsed = JSON.parse(sanitizeJsonResponse(response))
      const items = validateItems(parsed.items, userInput)

      logger.debug(
        { inputLength: userInput.length, itemCount: items.length },
        '[SaveDecomposition] Decomposed input',
      )

      return { items }
    } catch (error) {
      lastError = error
      logger.warn(
        { error, attempt: attempt + 1, maxRetries: MAX_RETRIES },
        '[SaveDecomposition] Attempt failed',
      )
    }
  }

  logger.error(
    { lastError },
    '[SaveDecomposition] All attempts failed, falling back to single item',
  )
  return { items: [{ content: userInput, tags: [] }] }
}

function validateItems(rawItems: unknown, originalInput: string): DecomposedItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return [{ content: originalInput, tags: [] }]
  }

  const items: DecomposedItem[] = rawItems
    .filter((item): item is Record<string, unknown> =>
      typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).content === 'string',
    )
    .map((item) => ({
      content: (item.content as string).trim(),
      tags: Array.isArray(item.tags)
        ? (item.tags as unknown[]).filter((t): t is string => typeof t === 'string')
        : [],
    }))
    .filter((item) => item.content.length > 0)

  if (items.length === 0) {
    return [{ content: originalInput, tags: [] }]
  }

  return items
}

function sanitizeJsonResponse(raw: string): string {
  let cleaned = raw.trim()
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/g, '')
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1)
  }
  return cleaned
}
