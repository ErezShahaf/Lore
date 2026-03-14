import { chat } from '../ollamaService'
import { storeThought, checkForDuplicate } from '../documentPipeline'
import { getSettings } from '../settingsService'
import { RESTRUCTURE_PROMPT } from '../../../prompts'
import type { ClassificationResult, AgentEvent, DocumentType } from '../../../shared/types'

export async function* handleThought(
  userInput: string,
  classification: ClassificationResult,
): AsyncGenerator<AgentEvent> {
  yield { type: 'status', message: 'Processing your thought...' }

  const duplicate = await checkForDuplicate(userInput)
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

  const settings = getSettings()
  const docType = mapSubtypeToDocType(classification.subtype)

  yield { type: 'status', message: 'Restructuring your note...' }

  let restructured = ''
  try {
    const stream = chat({
      model: settings.selectedModel,
      messages: [
        { role: 'user', content: RESTRUCTURE_PROMPT.replace('{userInput}', userInput) },
      ],
      stream: true,
      think: false,
    })

    for await (const chunk of stream) {
      restructured += chunk
    }
  } catch {
    restructured = userInput
  }

  yield { type: 'status', message: 'Saving...' }

  const today = new Date().toISOString().split('T')[0]

  const doc = await storeThought({
    content: restructured.trim() || userInput,
    originalInput: userInput,
    type: docType,
    date: classification.extractedDate ?? today,
    tags: classification.extractedTags,
  })

  yield { type: 'stored', documentId: doc.id }

  if (!duplicate) {
    const topic = classification.extractedTags.length > 0
      ? classification.extractedTags[0]
      : summarizeTopic(userInput)

    yield { type: 'chunk', content: `Got it! I've saved your ${docType} about ${topic}.` }
  }

  yield { type: 'done' }
}

function mapSubtypeToDocType(subtype: string): DocumentType {
  const map: Record<string, DocumentType> = {
    meeting: 'meeting',
    todo: 'todo',
    idea: 'note',
    learning: 'note',
    general: 'thought',
  }
  return map[subtype] ?? 'thought'
}

function summarizeTopic(input: string): string {
  const words = input.split(/\s+/).slice(0, 6).join(' ')
  return words.length < input.length ? `${words}...` : words
}
