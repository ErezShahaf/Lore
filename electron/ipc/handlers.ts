import { ipcMain, BrowserWindow } from 'electron'
import { resizeChatWindow, hideChatWindow } from '../windows/chatWindow'
import { getSettings, updateSettings } from '../services/settingsService'

export function registerIpcHandlers(): void {
  ipcMain.handle('ping', () => 'pong')

  ipcMain.on('chat:resize', (_event, { height }: { height: number }) => {
    resizeChatWindow(height)
  })

  ipcMain.on('chat:hide', () => {
    hideChatWindow()
  })

  ipcMain.handle('chat:send', async (_event, { message }: { message: string }) => {
    // Placeholder — real LLM integration in Phase 4
    return `I heard you say: "${message}". LLM integration coming soon!`
  })

  ipcMain.handle('settings:get', () => {
    return getSettings()
  })

  ipcMain.handle('settings:update', (_event, partial) => {
    const updated = updateSettings(partial)
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('settings:changed', updated)
    }
    return updated
  })
}
