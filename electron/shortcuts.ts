import { globalShortcut } from 'electron'
import { logger } from './logger'
import { toggleChatWindow } from './windows/chatWindow'

const DEFAULT_SHORTCUT = 'CommandOrControl+Shift+Space'

export function registerShortcuts(): void {
  const success = globalShortcut.register(DEFAULT_SHORTCUT, () => {
    toggleChatWindow()
  })

  if (!success) {
    logger.warn({ shortcut: DEFAULT_SHORTCUT }, 'Failed to register global shortcut')
  }
}

export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll()
}
