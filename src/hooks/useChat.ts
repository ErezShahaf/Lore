import { useState, useCallback, useEffect } from 'react'
import type { ChatMessage } from '../../shared/types'

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const clearMessages = useCallback(() => {
    setMessages([])
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const cleanup = window.loreAPI.onChatReset(() => {
      clearMessages()
    })
    return cleanup
  }, [clearMessages])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessage = {
      id: createId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const response = await window.loreAPI.sendMessage(trimmed)

      const assistantMsg: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: createId(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  return { messages, isLoading, sendMessage, clearMessages }
}
