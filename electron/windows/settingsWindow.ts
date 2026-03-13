import { BrowserWindow } from 'electron'
import { join } from 'path'

let settingsWindow: BrowserWindow | null = null

export function createSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return settingsWindow
  }

  settingsWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    title: 'Lore Settings',
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  const query = '?window=settings'

  if (process.env.VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(process.env.VITE_DEV_SERVER_URL + query)
  } else {
    settingsWindow.loadFile(join(process.env.DIST!, 'index.html'), {
      search: query,
    })
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show()
  })

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  return settingsWindow
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow && !settingsWindow.isDestroyed() ? settingsWindow : null
}
