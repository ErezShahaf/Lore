import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { createChatWindow, showChatWindow, getChatWindow } from './windows/chatWindow'
import { createTray, destroyTray } from './tray/trayManager'
import { registerShortcuts, unregisterShortcuts } from './shortcuts'
import { registerIpcHandlers } from './ipc/handlers'

process.env.DIST_ELECTRON = join(__dirname)
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    showChatWindow()
  })

  app.whenReady().then(() => {
    registerIpcHandlers()

    const chatWindow = createChatWindow()

    chatWindow.on('blur', () => {
      chatWindow.hide()
    })

    createTray()
    registerShortcuts()
  })

  app.on('window-all-closed', () => {
    // Keep running in tray — don't quit
  })

  app.on('activate', () => {
    if (getChatWindow()) {
      showChatWindow()
    } else {
      createChatWindow()
    }
  })

  app.on('will-quit', () => {
    unregisterShortcuts()
    destroyTray()
  })

  app.on('before-quit', () => {
    const win = getChatWindow()
    if (win) win.destroy()
  })
}
