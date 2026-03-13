import { useState, useEffect, useCallback } from 'react'
import type { AppSettings } from '../../shared/types'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.loreAPI.getSettings().then(s => {
      setSettings(s)
      setLoading(false)
    })

    const cleanup = window.loreAPI.onSettingsChanged(updated => {
      setSettings(updated)
    })

    return cleanup
  }, [])

  const update = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = await window.loreAPI.updateSettings(partial)
    setSettings(updated)
    return updated
  }, [])

  return { settings, loading, update }
}
