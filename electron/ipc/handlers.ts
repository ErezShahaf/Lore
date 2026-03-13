import { ipcMain } from 'electron'
import { resizeChatWindow, hideChatWindow } from '../windows/chatWindow'

export function registerIpcHandlers(): void {
  ipcMain.handle('ping', () => 'pong')

  ipcMain.on('chat:resize', (_event, { height }: { height: number }) => {
    resizeChatWindow(height)
  })

  ipcMain.on('chat:hide', () => {
    hideChatWindow()
  })
}
