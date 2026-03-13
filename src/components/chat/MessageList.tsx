import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble, TypingIndicator } from './MessageBubble'
import type { ChatMessage } from '../../../shared/types'

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
  statusMessage?: string | null
}

function EmptyState() {
  return (
    <div className="animate-fade-in flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
      <p className="text-sm text-muted-foreground">
        Store a thought, ask a question, or manage your todos.
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        Press <kbd className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground/70">Shift+Space</kbd> to toggle
      </p>
    </div>
  )
}

export function MessageList({ messages, isLoading, statusMessage }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, statusMessage])

  if (messages.length === 0 && !isLoading) return <EmptyState />

  return (
    <ScrollArea className="flex-1 overflow-hidden">
      <div className="flex flex-col gap-3 p-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {statusMessage && (
          <div className="animate-fade-in flex justify-start">
            <span className="text-xs italic text-muted-foreground">{statusMessage}</span>
          </div>
        )}
        {isLoading && !messages.some(m => m.isStreaming) && !statusMessage && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
