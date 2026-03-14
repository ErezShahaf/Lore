import { chat } from './ollamaService'
import { getSettings } from './settingsService'
import { CLASSIFICATION_PROMPT } from '../../prompts'
import type { ClassificationResult } from '../../shared/types'

const FALLBACK: ClassificationResult = {
  intent: 'thought',
  subtype: 'general',
  extractedDate: null,
  extractedTags: [],
  confidence: 0.5,
  reasoning: 'Fallback classification — could not parse LLM response',
}

export async function classifyInput(userInput: string): Promise<ClassificationResult> {
  const settings = getSettings()
  const now = new Date()
  const systemPrompt = buildSystemPrompt(now)

  try {
    const stream = chat({
      model: settings.selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput },
      ],
      stream: false,
      format: 'json',
      think: false,
    })

    let response = ''
    for await (const chunk of stream) {
      response += chunk
    }

    const parsed = JSON.parse(response)

    return {
      intent: validateIntent(parsed.intent),
      subtype: typeof parsed.subtype === 'string' ? parsed.subtype : 'general',
      extractedDate: typeof parsed.extractedDate === 'string' ? parsed.extractedDate : null,
      extractedTags: Array.isArray(parsed.extractedTags)
        ? parsed.extractedTags.filter((t: unknown) => typeof t === 'string')
        : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
    }
  } catch (err) {
    console.error('[Classifier] Failed to classify input:', err)
    return { ...FALLBACK }
  }
}

function validateIntent(value: unknown): ClassificationResult['intent'] {
  const valid = ['thought', 'question', 'command', 'instruction']
  return valid.includes(value as string)
    ? (value as ClassificationResult['intent'])
    : 'thought'
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? 6 : day - 1
  d.setDate(d.getDate() - diff)
  return d
}

function buildSystemPrompt(now: Date): string {
  const currentDate = toISODate(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const thisMonday = getMondayOfWeek(now)
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(lastMonday.getDate() - 7)

  return CLASSIFICATION_PROMPT
    .replace(/\{currentDate\}/g, currentDate)
    .replace('{currentDay}', DAY_NAMES[now.getDay()])
    .replace('{yesterdayDate}', toISODate(yesterday))
    .replace('{thisWeekStart}', toISODate(thisMonday))
    .replace('{lastWeekStart}', toISODate(lastMonday))
}
