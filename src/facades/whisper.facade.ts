// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pipeline = any

import type { TranscriptionResult } from '@/types/tool.types'
import { chunksToSRT, chunksToVTT } from '@/lib/utils'

class WhisperFacade {
  private pipeline: Pipeline | null = null
  private modelSize: 'tiny' | 'base' = 'tiny'

  async load(
    modelSize: 'tiny' | 'base' = 'tiny',
    onProgress?: (p: number, label: string) => void
  ): Promise<void> {
    if (this.pipeline && this.modelSize === modelSize) return

    try {
      // Dynamic import keeps the heavy WASM bundle out of the initial JS payload
      const { pipeline } = await import('@xenova/transformers')

      this.pipeline = await pipeline(
        'automatic-speech-recognition',
        `Xenova/whisper-${modelSize}`,
        {
          progress_callback: (p: { progress: number; status: string }) => {
            onProgress?.(p.progress, p.status)
          },
        }
      )

      this.modelSize = modelSize
    } catch (err) {
      this.pipeline = null
      throw new Error(
        `Whisper model failed to load: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  async transcribe(input: File, language?: string): Promise<TranscriptionResult> {
    if (!this.pipeline) {
      throw new Error('Whisper pipeline is not loaded. Call whisperFacade.load() first.')
    }

    try {
      const arrayBuffer = await input.arrayBuffer()

      const result = await this.pipeline(arrayBuffer, {
        return_timestamps: true,
        language: language ?? null,
        chunk_length_s: 30,
        stride_length_s: 5,
      })

      const text: string = result.text ?? ''
      const rawChunks: Array<{ timestamp: [number, number]; text: string }> =
        result.chunks ?? []

      const chunks = rawChunks.map((c) => ({
        start: c.timestamp[0],
        end: c.timestamp[1],
        text: c.text,
      }))

      return {
        text,
        chunks,
        srt: chunksToSRT(chunks),
        vtt: chunksToVTT(chunks),
      }
    } catch (err) {
      throw new Error(
        `Transcription failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }
}

export const whisperFacade = new WhisperFacade()
