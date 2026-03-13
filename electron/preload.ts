import { contextBridge, ipcRenderer } from 'electron'

const loreAPI = {
  ping: () => ipcRenderer.invoke('ping'),
  resizeChatWindow: (height: number) => ipcRenderer.send('chat:resize', { height }),
  hideChatWindow: () => ipcRenderer.send('chat:hide'),
  onChatReset: (callback: () => void) => {
    ipcRenderer.on('chat:reset', callback)
    return () => ipcRenderer.removeListener('chat:reset', callback)
  },
}

contextBridge.exposeInMainWorld('loreAPI', loreAPI)

declare global {
  interface Window {
    loreAPI: typeof loreAPI
  }
}
