import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings } from '../shared/types'

const loreAPI = {
  ping: () => ipcRenderer.invoke('ping'),

  resizeChatWindow: (height: number) =>
    ipcRenderer.send('chat:resize', { height }),

  hideChatWindow: () => ipcRenderer.send('chat:hide'),

  sendMessage: (message: string): Promise<string> =>
    ipcRenderer.invoke('chat:send', { message }),

  onMessageChunk: (callback: (chunk: string) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, { chunk }: { chunk: string }) =>
      callback(chunk)
    ipcRenderer.on('chat:response-chunk', handler)
    return () => ipcRenderer.removeListener('chat:response-chunk', handler)
  },

  onResponseEnd: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('chat:response-end', handler)
    return () => ipcRenderer.removeListener('chat:response-end', handler)
  },

  onChatReset: (callback: () => void) => {
    ipcRenderer.on('chat:reset', callback)
    return () => ipcRenderer.removeListener('chat:reset', callback)
  },

  getSettings: (): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:get'),

  updateSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('settings:update', settings),

  onSettingsChanged: (callback: (settings: AppSettings) => void) => {
    const handler = (_e: Electron.IpcRendererEvent, settings: AppSettings) =>
      callback(settings)
    ipcRenderer.on('settings:changed', handler)
    return () => ipcRenderer.removeListener('settings:changed', handler)
  },
}

contextBridge.exposeInMainWorld('loreAPI', loreAPI)

declare global {
  interface Window {
    loreAPI: typeof loreAPI
  }
}
