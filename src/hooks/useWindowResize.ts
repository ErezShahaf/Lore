import { useEffect, useRef } from 'react'

import {
  CHAT_WINDOW_MIN_HEIGHT,
  CHAT_WINDOW_MAX_HEIGHT,
} from '../../shared/chatWindowConstants'

const INPUT_BAR_HEIGHT = 152
const PADDING = 16
const WRAPPER_PADDING = 24

export function useWindowResize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const lastHeight = useRef(CHAT_WINDOW_MIN_HEIGHT)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => {
      const contentHeight = el.scrollHeight
      const desired = Math.min(
        contentHeight + INPUT_BAR_HEIGHT + PADDING + WRAPPER_PADDING * 2,
        CHAT_WINDOW_MAX_HEIGHT,
      )
      const clamped = Math.max(CHAT_WINDOW_MIN_HEIGHT, desired)

      if (clamped !== lastHeight.current) {
        lastHeight.current = clamped
        window.loreAPI.resizeChatWindow(clamped)
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef])
}
