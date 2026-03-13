import type { AppSettings } from '../../shared/types'

declare global {
  interface Window {
    loreAPI: {
      ping: () => Promise<string>
      resizeChatWindow: (height: number) => void
      hideChatWindow: () => void
      sendMessage: (message: string) => Promise<string>
      onMessageChunk: (callback: (chunk: string) => void) => () => void
      onResponseEnd: (callback: () => void) => () => void
      onChatReset: (callback: () => void) => () => void
      getSettings: () => Promise<AppSettings>
      updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>
      onSettingsChanged: (callback: (settings: AppSettings) => void) => () => void
    }
  }
}
