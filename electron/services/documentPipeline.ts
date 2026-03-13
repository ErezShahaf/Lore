import { v4 as uuidv4 } from 'uuid'
import { embedText } from './embeddingService'
import {
  insertDocument,
  searchSimilar,
  getAllDocuments,
} from './lanceService'
import type {
  LoreDocument,
  StoreThoughtInput,
  RetrievalOptions,
} from '../../shared/types'

const DEFAULT_SIMILARITY_THRESHOLD = 0.5
const DEFAULT_MAX_RESULTS = 20

export async function storeThought(input: StoreThoughtInput): Promise<LoreDocument> {
  const vector = await embedText(input.content)
  const now = new Date().toISOString()

  const document: LoreDocument = {
    id: uuidv4(),
    content: input.content,
    vector,
    type: input.type,
    createdAt: now,
    updatedAt: now,
    date: input.date,
    tags: input.tags.join(','),
    source: input.originalInput,
    metadata: '{}',
    isDeleted: false,
  }

  await insertDocument(document)
  return document
}

export async function retrieveRelevantDocuments(
  query: string,
  options?: RetrievalOptions,
): Promise<LoreDocument[]> {
  const queryVector = await embedText(query)

  const limit = options?.maxResults ?? DEFAULT_MAX_RESULTS
  const threshold = options?.similarityThreshold ?? DEFAULT_SIMILARITY_THRESHOLD

  const filterParts: string[] = []
  if (options?.type) {
    filterParts.push(`type = '${options.type}'`)
  }
  if (options?.dateFrom) {
    filterParts.push(`date >= '${options.dateFrom}'`)
  }
  if (options?.dateTo) {
    filterParts.push(`date <= '${options.dateTo}'`)
  }

  const filter = filterParts.length > 0 ? filterParts.join(' AND ') : undefined

  const results = await searchSimilar(queryVector, limit, filter)

  return results.filter((doc) => {
    if ('_distance' in doc) {
      const distance = (doc as Record<string, unknown>)._distance as number
      return distance <= (1 - threshold)
    }
    return true
  })
}

export async function getDocumentCount(): Promise<number> {
  const docs = await getAllDocuments(false)
  return docs.length
}
