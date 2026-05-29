'use client'

import { useToolStore } from '@/store/tool.store'
import { usageApi } from '@/api'

interface UseAudioToolOptions {
  onProcess: (
    files: File[],
    setProgress: (p: number, label?: string) => void
  ) => Promise<{ blob: Blob; filename: string }>
  toolSlug: string
}

export function useAudioTool({ onProcess, toolSlug }: UseAudioToolOptions) {
  const store = useToolStore()

  const process = async () => {
    if (store.inputFiles.length === 0) {
      store.setError('Please add at least one audio file before processing.')
      return
    }

    store.setStatus('processing')
    store.setProgress(0)
    const startTime = Date.now()

    try {
      const { blob, filename } = await onProcess(store.inputFiles, (p, label) => {
        store.setProgress(p, label)
      })

      store.setResult(blob, filename)

      // Fire-and-forget usage logging
      usageApi
        .logOperation({
          tool: toolSlug,
          input_size_bytes: store.inputFiles.reduce((acc, f) => acc + f.size, 0),
          output_size_bytes: blob.size,
          processing_ms: Date.now() - startTime,
          status: 'completed',
        })
        .catch(() => {
          // Ignore logging errors — non-critical
        })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      store.setError(msg)

      // Fire-and-forget failure logging
      usageApi
        .logOperation({
          tool: toolSlug,
          input_size_bytes: store.inputFiles.reduce((acc, f) => acc + f.size, 0),
          output_size_bytes: 0,
          processing_ms: Date.now() - startTime,
          status: 'failed',
        })
        .catch(() => {})
    }
  }

  return { ...store, process }
}
