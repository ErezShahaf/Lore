export interface ThoughtDocument {
  id: string
  content: string
  type: 'thought' | 'todo' | 'instruction'
  embedding?: number[]
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AppSettings {
  shortcut: string
  startOnLogin: boolean
  hideOnBlur: boolean
  selectedModel: string
  embeddingModel: string
  ollamaHost: string
}

export type InputClassification =
  | 'thought'
  | 'question'
  | 'command'
  | 'instruction'
