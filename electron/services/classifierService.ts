import { logger } from '../logger'
import type { AgentEvent, ClassificationResult, ConversationEntry } from '../../shared/types'
import { extractMetadata } from './metadataExtractionService'
import { routeIntent } from './intentRouteService'
import { synthesizeSituation } from './situationService'

const ROUTE_ONLY_CONFIDENCE_THRESHOLD = 0.75

export async function* classifyInputWithStatusEvents(
  userInput: string,
  conversationHistory: readonly ConversationEntry[] = [],
): AsyncGenerator<AgentEvent, ClassificationResult> {
  const now = new Date()

  yield { type: 'status', message: 'Summarizing conversation and situation…' }
  const situation = await synthesizeSituation(userInput, conversationHistory)

  yield { type: 'status', message: 'Routing intent…' }
  let route
  try {
    route = await routeIntent(situation, userInput, conversationHistory)
  } catch (err) {
    logger.error({ err }, '[Classifier] Intent routing failed')
    throw new Error(
      `Intent routing failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  if (route.confidence < ROUTE_ONLY_CONFIDENCE_THRESHOLD) {
    return {
      intent: route.intent,
      subtype: 'general',
      extractedDate: null,
      extractedTags: [],
      confidence: route.confidence,
      reasoning: route.reasoning,
      situationSummary: situation.situationSummary,
    }
  }

  yield { type: 'status', message: 'Extracting tags and dates…' }
  const metadata = await extractMetadata(route.intent, situation, userInput, conversationHistory, now)

  return {
    intent: route.intent,
    subtype: metadata.subtype,
    extractedDate: metadata.extractedDate,
    extractedTags: metadata.extractedTags,
    confidence: route.confidence,
    reasoning: `${route.reasoning} | Metadata: subtype=${metadata.subtype}`,
    situationSummary: situation.situationSummary,
  }
}

export async function classifyInput(
  userInput: string,
  conversationHistory: readonly ConversationEntry[] = [],
): Promise<ClassificationResult> {
  const iterator = classifyInputWithStatusEvents(userInput, conversationHistory)
  let step = await iterator.next()
  while (!step.done) {
    step = await iterator.next()
  }
  return step.value as ClassificationResult
}
