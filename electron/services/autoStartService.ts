import { app } from 'electron'
import { getSettings } from './settingsService'

export function applyAutoStart(): void {
  const { startOnLogin } = getSettings()
  setAutoStart(startOnLogin)
}

export function setAutoStart(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    args: ['--hidden'],
  })
}
