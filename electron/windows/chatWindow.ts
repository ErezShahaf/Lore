import { BrowserWindow, screen } from 'electron'
import { join } from 'path'

let chatWindow: BrowserWindow | null = null

const CHAT_WIDTH = 600
const CHAT_DEFAULT_HEIGHT = 80

export function createChatWindow(): BrowserWindow {
  if (chatWindow && !chatWindow.isDestroyed()) return chatWindow

  const { workArea } = screen.getPrimaryDisplay()

  const x = Math.round(workArea.x + (workArea.width - CHAT_WIDTH) / 2)
  const y = Math.round(workArea.y + workArea.height * 0.35 - CHAT_DEFAULT_HEIGHT / 2)

  chatWindow = new BrowserWindow({
    width: CHAT_WIDTH,
    height: CHAT_DEFAULT_HEIGHT,
    x,
    y,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    chatWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    chatWindow.loadFile(join(process.env.DIST!, 'index.html'))
  }

  chatWindow.on('closed', () => {
    chatWindow = null
  })

  return chatWindow
}

export function getChatWindow(): BrowserWindow | null {
  return chatWindow && !chatWindow.isDestroyed() ? chatWindow : null
}

export function showChatWindow(): void {
  const win = getChatWindow()
  if (!win) return

  const { workArea } = screen.getPrimaryDisplay()
  const [width] = win.getSize()
  const x = Math.round(workArea.x + (workArea.width - width) / 2)
  const y = Math.round(workArea.y + workArea.height * 0.35 - CHAT_DEFAULT_HEIGHT / 2)
  win.setPosition(x, y)

  win.show()
  win.focus()
}

export function hideChatWindow(): void {
  const win = getChatWindow()
  if (!win) return

  win.hide()
  win.webContents.send('chat:reset')
}

export function toggleChatWindow(): void {
  const win = getChatWindow()
  if (!win) return

  if (win.isVisible()) {
    hideChatWindow()
  } else {
    showChatWindow()
  }
}

export function resizeChatWindow(height: number): void {
  const win = getChatWindow()
  if (!win) return

  const clamped = Math.max(CHAT_DEFAULT_HEIGHT, Math.min(height, 600))
  const [width] = win.getSize()
  win.setSize(width, clamped)
}
