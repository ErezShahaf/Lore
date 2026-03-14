import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, X } from 'lucide-react'

interface InputBarProps {
  onSend: (message: string) => void
  onRequestClose: () => void
  disabled?: boolean
  disabledReason?: string
}

export function InputBar({ onSend, onRequestClose, disabled, disabledReason }: InputBarProps) {
  const [value, setValue] = useState('')
  const [flashing, setFlashing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    const cleanup = window.loreAPI.onChatReset(() => {
      requestAnimationFrame(() => textareaRef.current?.focus())
    })
    return cleanup
  }, [])

  useEffect(() => {
    const cleanup = window.loreAPI.onChatShown(() => {
      requestAnimationFrame(() => textareaRef.current?.focus())
    })
    return cleanup
  }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return

    setFlashing(true)
    setTimeout(() => setFlashing(false), 300)

    onSend(trimmed)
    setValue('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [value, disabled, onSend])

  const handleClear = useCallback(() => {
    setValue('')
    textareaRef.current?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onRequestClose()
        return
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  return (
    <div
      className={`flex shrink-0 items-end gap-2 border-t border-border/40 bg-[#0d0d0d] px-4 py-3 transition-opacity ${flashing ? 'animate-send-flash' : ''}`}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabledReason || "Type a thought or ask a question..."}
        disabled={disabled}
        rows={1}
        className="chat-input-textarea h-[38px] min-h-0 flex-1 resize-none overflow-y-auto bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
      />
      {value.length > 0 && !disabled && (
        <button
          onClick={handleClear}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
      >
        <Send className="size-4" />
      </button>
    </div>
  )
}
