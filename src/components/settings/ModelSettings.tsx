import { Input } from '@/components/ui/input'
import type { AppSettings } from '../../../shared/types'

interface ModelSettingsProps {
  settings: AppSettings
  onUpdate: (partial: Partial<AppSettings>) => void
}

export function ModelSettings({ settings, onUpdate }: ModelSettingsProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Model</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure the local LLM and embedding models.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Chat Model
          </label>
          <Input
            value={settings.selectedModel}
            onChange={e => onUpdate({ selectedModel: e.target.value })}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            The Ollama model used for chat and classification.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Embedding Model
          </label>
          <Input
            value={settings.embeddingModel}
            onChange={e => onUpdate({ embeddingModel: e.target.value })}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            The model used to generate vector embeddings for search.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Ollama Host
          </label>
          <Input
            value={settings.ollamaHost}
            onChange={e => onUpdate({ ollamaHost: e.target.value })}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">
            The URL where Ollama is running.
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Ollama status will be shown here once connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
