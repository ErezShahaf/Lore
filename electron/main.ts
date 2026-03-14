import { app, BrowserWindow } from 'electron'
import { logger } from './logger'
import { join } from 'path'
import { appendFileSync } from 'fs'
import { createChatWindow, showChatWindow, getChatWindow } from './windows/chatWindow'
import { createSetupWindow } from './windows/setupWindow'
import { createTray, destroyTray } from './tray/trayManager'
import { registerShortcuts, unregisterShortcuts } from './shortcuts'
import { registerIpcHandlers } from './ipc/handlers'
import { getSettings, updateSettings } from './services/settingsService'
import { startHealthCheck, stopHealthCheck, preloadModels } from './services/ollamaService'
import { bootstrapOllama, stopOllama, isOllamaSetupNeeded } from './services/ollamaBootstrap'
import { initialize as initLanceDB, cleanupOldDeleted, compactTable } from './services/lanceService'
import { applyAutoStart } from './services/autoStartService'

function logErrorToFile(label: string, err: unknown): void {
  try {
    const logPath = join(app.getPath('userData'), 'error.log')
    const timestamp = new Date().toISOString()
    const message = err instanceof Error ? err.stack ?? err.message : String(err)
    appendFileSync(logPath, `[${timestamp}] ${label}: ${message}\n`, 'utf-8')
  } catch {
    // Avoid infinite loops if logging itself fails
  }
}

process.on('uncaughtException', (err) => {
  logger.error({ err }, '[Lore] Uncaught exception')
  logErrorToFile('uncaughtException', err)
})

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, '[Lore] Unhandled rejection')
  logErrorToFile('unhandledRejection', reason)
})

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

  app.whenReady().then(async () => {
    registerIpcHandlers()

    try {
      await initLanceDB()
      logger.info('[Lore] LanceDB initialized')

      cleanupOldDeleted(30).then((count) => {
        if (count > 0) logger.info({ count }, '[Lore] Cleaned up old deleted documents')
      }).catch(() => {})

      compactTable().catch(() => {})
    } catch (err) {
      logger.error({ err }, '[Lore] Failed to initialize LanceDB')
    }

    const settings = getSettings()

    createTray()
    registerShortcuts()
    applyAutoStart()

    startHealthCheck((status) => {
      for (const win of BrowserWindow.getAllWindows()) {
        win.webContents.send('ollama:status-changed', status)
      }
    })

    const needsSetup = await isOllamaSetupNeeded()

    if (needsSetup) {
      createSetupWindow()
    } else {
      if (!settings.ollamaSetupComplete) {
        updateSettings({ ollamaSetupComplete: true })
      }

      createChatWindow()

      bootstrapOllama()
        .then(() => preloadModels())
        .catch((err) => {
          logger.error({ err }, '[Lore] Ollama bootstrap error')
        })
    }
  })

  app.on('window-all-closed', () => {
    // Keep running in tray
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
    stopHealthCheck()
    stopOllama()
  })

  app.on('before-quit', () => {
    const win = getChatWindow()
    if (win) win.destroy()
  })
}
