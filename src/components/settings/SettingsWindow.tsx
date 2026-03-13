import { useState } from 'react'
import { Settings, Cpu, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'
import { GeneralSettings } from './GeneralSettings'
import { ModelSettings } from './ModelSettings'
import { AboutSettings } from './AboutSettings'

type Tab = 'general' | 'model' | 'about'

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'model', label: 'Model', icon: Cpu },
  { id: 'about', label: 'About', icon: Info },
]

export function SettingsWindow() {
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const { settings, loading, update } = useSettings()

  if (loading || !settings) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <nav className="flex w-48 shrink-0 flex-col border-r border-border bg-[#0d0d0d] p-3">
        <h1 className="mb-4 px-3 pt-2 text-sm font-semibold text-foreground">
          Lore Settings
        </h1>
        <div className="space-y-0.5">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === 'general' && (
          <GeneralSettings settings={settings} onUpdate={update} />
        )}
        {activeTab === 'model' && (
          <ModelSettings settings={settings} onUpdate={update} />
        )}
        {activeTab === 'about' && <AboutSettings />}
      </main>
    </div>
  )
}
