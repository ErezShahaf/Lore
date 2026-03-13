import { ChatWindow } from '@/components/chat/ChatWindow'
import { SettingsWindow } from '@/components/settings/SettingsWindow'

function getWindowType(): 'chat' | 'settings' {
  const params = new URLSearchParams(window.location.search)
  return params.get('window') === 'settings' ? 'settings' : 'chat'
}

function App() {
  const windowType = getWindowType()

  if (windowType === 'settings') {
    return <SettingsWindow />
  }

  return <ChatWindow />
}

export default App
