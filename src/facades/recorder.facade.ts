const BITRATE_MAP: Record<'low' | 'medium' | 'high', number> = {
  low: 64_000,
  medium: 128_000,
  high: 192_000,
}

class RecorderFacade {
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private stream: MediaStream | null = null

  async start(quality: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      throw new Error('Recorder is already active. Call stop() before starting a new recording.')
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.chunks = []

      const options: MediaRecorderOptions = {
        audioBitsPerSecond: BITRATE_MAP[quality],
      }

      // Prefer audio/webm;codecs=opus when supported
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm'
      }

      this.mediaRecorder = new MediaRecorder(this.stream, options)

      this.mediaRecorder.addEventListener('dataavailable', (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data)
        }
      })

      this.mediaRecorder.start(250) // collect chunks every 250ms
    } catch (err) {
      this.stream?.getTracks().forEach((t) => t.stop())
      this.stream = null
      this.mediaRecorder = null
      throw new Error(
        `Recorder failed to start: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  pause(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return
    this.mediaRecorder.pause()
  }

  resume(): void {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'paused') return
    this.mediaRecorder.resume()
  }

  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recorder is not active.'))
        return
      }

      this.mediaRecorder.addEventListener(
        'stop',
        () => {
          this.stream?.getTracks().forEach((t) => t.stop())
          this.stream = null

          const blob = new Blob(this.chunks, { type: 'audio/webm' })
          this.chunks = []
          resolve(blob)
        },
        { once: true }
      )

      this.mediaRecorder.addEventListener(
        'error',
        (event) => {
          reject(new Error(`Recorder error: ${event.error?.message ?? 'unknown'}`))
        },
        { once: true }
      )

      this.mediaRecorder.stop()
    })
  }

  getState(): RecordingState | 'inactive' {
    return this.mediaRecorder?.state ?? 'inactive'
  }
}

export const recorderFacade = new RecorderFacade()
