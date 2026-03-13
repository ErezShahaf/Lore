import { Input } from '@/components/ui/input'
import type { AppSettings } from '../../../shared/types'

interface GeneralSettingsProps {
  settings: AppSettings
  onUpdate: (partial: Partial<AppSettings>) => void
}

export function GeneralSettings({ settings, onUpdate }: GeneralSettingsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure app behavior and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Keyboard Shortcut
          </label>
          <Input
            value={settings.shortcut}
            onChange={e => onUpdate({ shortcut: e.target.value })}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            Global shortcut to toggle the Lore popup.
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Start on login</p>
            <p className="text-xs text-muted-foreground">
              Launch Lore automatically when you log in.
            </p>
          </div>
          <button
            onClick={() => onUpdate({ startOnLogin: !settings.startOnLogin })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              settings.startOnLogin ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
                settings.startOnLogin ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Hide on blur</p>
            <p className="text-xs text-muted-foreground">
              Hide the popup when it loses focus.
            </p>
          </div>
          <button
            onClick={() => onUpdate({ hideOnBlur: !settings.hideOnBlur })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              settings.hideOnBlur ? 'bg-primary' : 'bg-secondary'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white transition-transform ${
                settings.hideOnBlur ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
