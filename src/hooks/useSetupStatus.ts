import { useState, useEffect, useCallback } from 'react'
import type { OllamaSetupProgress, OllamaStatus, AppSettings } from '../../shared/types'

const MODEL_REFRESH_RETRY_DELAYS_MS = [200, 500, 1000] as const

export type SetupState =
  | { status: 'setting-up'; phase: OllamaSetupProgress['phase']; percent: number; message: string }
  | { status: 'needs-models'; missingChat: boolean; missingEmbedding: boolean }
  | { status: 'ready' }

export function useSetupStatus(): SetupState {
  const [setupProgress, setSetupProgress] = useState<OllamaSetupProgress | null>(null)
  const [ollamaConnected, setOllamaConnected] = useState(false)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [installedModelNames, setInstalledModelNames] = useState<string[]>([])

  const refreshModels = useCallback(async (requiredModelNames: readonly string[] = []) => {
    const normalizedRequiredModelNames = requiredModelNames.filter((name) => name.length > 0)

    for (let attemptIndex = 0; attemptIndex <= MODEL_REFRESH_RETRY_DELAYS_MS.length; attemptIndex += 1) {
      try {
        const models = await window.loreAPI.listModels()
        const installedNames = models.map((model) => model.name)
        setInstalledModelNames(installedNames)

        const hasAllRequiredModels = normalizedRequiredModelNames.every((requiredModelName) =>
          installedNames.some((installedName) =>
            installedName === requiredModelName || installedName.startsWith(requiredModelName + ':')))

        if (hasAllRequiredModels || attemptIndex === MODEL_REFRESH_RETRY_DELAYS_MS.length) {
          return
        }
      } catch {
        if (attemptIndex === MODEL_REFRESH_RETRY_DELAYS_MS.length) {
          setInstalledModelNames([])
          return
        }
      }

      await waitFor(MODEL_REFRESH_RETRY_DELAYS_MS[attemptIndex])
    }
  }, [])

  useEffect(() => {
    window.loreAPI.getOllamaStatus().then(s => setOllamaConnected(s.connected))
    window.loreAPI.getSettings().then(setSettings)
    refreshModels()

    const cleanupSetup = window.loreAPI.onSetupProgress((progress) => {
      setSetupProgress(progress)
      if (progress.phase === 'ready') {
        setOllamaConnected(true)
        refreshModels()
      }
    })

    const cleanupStatus = window.loreAPI.onOllamaStatusChange((status: OllamaStatus) => {
      setOllamaConnected(status.connected)
      if (status.connected) refreshModels()
    })

    const cleanupSettings = window.loreAPI.onSettingsChanged((updated: AppSettings) => {
      setSettings(updated)
      refreshModels([updated.selectedModel, updated.embeddingModel])
    })

    const cleanupPullComplete = window.loreAPI.onPullComplete((result) => {
      if (result.success) {
        refreshModels([result.model])
      }
    })

    return () => {
      cleanupSetup()
      cleanupStatus()
      cleanupSettings()
      cleanupPullComplete()
    }
  }, [refreshModels])

  if (!ollamaConnected && setupProgress && setupProgress.phase !== 'ready') {
    return {
      status: 'setting-up',
      phase: setupProgress.phase,
      percent: setupProgress.percent,
      message: setupProgress.message,
    }
  }

  if (!ollamaConnected && !setupProgress) {
    return {
      status: 'setting-up',
      phase: 'downloading',
      percent: 0,
      message: 'Connecting to AI engine...',
    }
  }

  if (settings) {
    const chatModel = settings.selectedModel
    const embeddingModel = settings.embeddingModel

    const chatInstalled = chatModel
      && installedModelNames.some(n => n === chatModel || n.startsWith(chatModel + ':'))
    const embeddingInstalled = embeddingModel
      && installedModelNames.some(n => n === embeddingModel || n.startsWith(embeddingModel + ':'))

    if (!chatInstalled || !embeddingInstalled) {
      return {
        status: 'needs-models',
        missingChat: !chatInstalled,
        missingEmbedding: !embeddingInstalled,
      }
    }
  }

  return { status: 'ready' }
}

function waitFor(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs)
  })
}
