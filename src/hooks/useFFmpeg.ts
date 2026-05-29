'use client'

import { useState } from 'react'
import { ffmpegFacade } from '@/facades'

export function useFFmpeg() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = async (onProgress?: (p: number) => void) => {
    try {
      setLoadError(null)
      await ffmpegFacade.load(onProgress)
      setIsLoaded(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setLoadError(msg)
      setIsLoaded(false)
    }
  }

  return { isLoaded, loadError, load }
}
