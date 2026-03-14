import { app, BrowserWindow } from 'electron'
import { logger } from '../logger'
import { join } from 'path'
import { ElectronOllama } from 'electron-ollama'
import { getSettings } from './settingsService'
import type { OllamaSetupProgress } from '../../shared/types'

let eo: ElectronOllama | null = null

function broadcast(progress: OllamaSetupProgress): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send('ollama:setup-progress', progress)
  }
}

export function getDefaultOllamaModelsPath(): string {
  return join(app.getPath('home'), '.ollama', 'models')
}

function applyOllamaEnv(): void {
  const settings = getSettings()
  process.env.OLLAMA_MODELS = settings.ollamaModelsPath || getDefaultOllamaModelsPath()
  process.env.OLLAMA_MAX_LOADED_MODELS = '2'
}

export async function isOllamaSetupNeeded(): Promise<boolean> {
  const settings = getSettings()
  if (settings.ollamaSetupComplete) return false

  const host = settings.ollamaHost || 'http://127.0.0.1:11434'
  try {
    const res = await fetch(`${host}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    })
    return !res.ok
  } catch {
    return true
  }
}

export async function bootstrapOllama(customBasePath?: string): Promise<void> {
  const basePath = customBasePath || getSettings().ollamaPath || app.getPath('userData')
  eo = new ElectronOllama({
    basePath,
  })

  applyOllamaEnv()

  try {
    if (await eo.isRunning()) {
      logger.warn(
        '[Lore] Ollama already running — OLLAMA_MAX_LOADED_MODELS and other env vars will not apply to the external instance. ' +
        'If models keep reloading, restart Ollama so it picks up the app\'s environment.',
      )
      broadcast({ phase: 'ready', percent: 100, message: 'Ollama is ready' })
      return
    }

    broadcast({ phase: 'downloading', percent: 0, message: 'Preparing AI engine...' })

    const metadata = await eo.getMetadata('latest')

    if (await eo.isDownloaded(metadata.version)) {
      broadcast({ phase: 'starting', percent: 100, message: 'Starting AI engine...' })
    }

    await eo.serve(metadata.version, {
      downloadLog: (percent, message) => {
        broadcast({ phase: 'downloading', percent, message })
      },
      serverLog: (message) => {
        logger.debug({ message }, '[Ollama]')
      },
    })

    logger.info('[Lore] Ollama started via electron-ollama')
    broadcast({ phase: 'ready', percent: 100, message: 'AI engine is ready' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to start AI engine'
    logger.error({ message }, '[Lore] Ollama bootstrap failed')
    broadcast({ phase: 'error', percent: 0, message })
  }
}

export async function stopOllama(): Promise<void> {
  try {
    await eo?.getServer()?.stop()
    logger.info('[Lore] Ollama server stopped')
  } catch {
    // Ignore shutdown errors
  }
}

export async function restartOllamaWithNewModelsPath(): Promise<void> {
  logger.info('[Lore] Restarting Ollama with updated models path...')
  await stopOllama()
  await new Promise(resolve => setTimeout(resolve, 500))
  await bootstrapOllama()
}
