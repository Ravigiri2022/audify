'use client'

import { useState } from 'react'
import { whisperFacade } from '@/facades'

export function useWhisper() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = async (modelSize: 'tiny' | 'base') => {
    try {
      setLoadError(null)
      setDownloadProgress(0)
      await whisperFacade.load(modelSize, (p, _label) => {
        setDownloadProgress(p)
      })
      setIsLoaded(true)
      setDownloadProgress(100)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setLoadError(msg)
      setIsLoaded(false)
    }
  }

  return { isLoaded, downloadProgress, loadError, load }
}
