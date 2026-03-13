import { globalShortcut } from 'electron'
import { toggleChatWindow } from './windows/chatWindow'

const DEFAULT_SHORTCUT = 'CommandOrControl+Shift+Space'

export function registerShortcuts(): void {
  const success = globalShortcut.register(DEFAULT_SHORTCUT, () => {
    toggleChatWindow()
  })

  if (!success) {
    console.warn(`Failed to register global shortcut: ${DEFAULT_SHORTCUT}`)
  }
}

export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll()
}
