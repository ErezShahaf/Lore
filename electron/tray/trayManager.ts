import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import { showChatWindow } from '../windows/chatWindow'

let tray: Tray | null = null

function getIconPath(): string {
  const isDev = !!process.env.VITE_DEV_SERVER_URL
  if (isDev) {
    return join(__dirname, '..', 'resources', 'icon.png')
  }
  return join(process.resourcesPath, 'icon.png')
}

export function createTray(): Tray {
  if (tray) return tray

  let icon = nativeImage.createFromPath(getIconPath())

  if (icon.isEmpty()) {
    icon = nativeImage.createEmpty()
  }

  if (process.platform === 'darwin') {
    icon = icon.resize({ width: 16, height: 16 })
  }

  tray = new Tray(icon)
  tray.setToolTip('Lore')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Lore',
      click: () => showChatWindow(),
    },
    {
      label: 'Settings',
      click: () => {
        // Placeholder — settings window comes in Phase 3
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ])

  tray.setContextMenu(contextMenu)

  tray.on('click', () => showChatWindow())

  return tray
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy()
    tray = null
  }
}
