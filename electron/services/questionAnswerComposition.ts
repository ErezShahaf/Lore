import { chat } from './ollamaService'

/**
 * Single place for streaming Lore’s question-answering model (grounded RAG and no-retrieval cases).
 */
export async function* streamQuestionLlmChunks(
  model: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
): AsyncGenerator<string> {
  const stream = chat({
    model,
    messages,
    stream: true,
    think: false,
  })

  for await (const chunk of stream) {
    yield chunk
  }
}

export function buildNoDocumentsQuestionUserMessage(input: {
  readonly situationSummary: string
  readonly userInput: string
}): string {
  return [
    'Retrieval returned no matching documents for this question.',
    '',
    'Situation summary:',
    input.situationSummary.trim() || '(none)',
    '',
    'User question:',
    input.userInput,
    '',
    'You must not invent facts or pretend notes exist. Briefly tell the user you could not find relevant information in their library. If User standing instructions in the system prompt specify exact wording, tone, or greetings for this situation, follow them. Otherwise reply in one or two short sentences.',
  ].join('\n')
}
