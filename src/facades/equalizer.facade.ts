import type { EqBand } from '@/types/tool.types'

const DEFAULT_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 16000]

class EqualizerFacade {
  private audioCtx: AudioContext | null = null
  private sourceNode: AudioBufferSourceNode | null = null
  private filters: BiquadFilterNode[] = []

  async load(file: File): Promise<AudioBuffer> {
    try {
      // Create a fresh AudioContext for each load
      if (this.audioCtx) {
        await this.audioCtx.close()
      }
      this.audioCtx = new AudioContext()
      this.sourceNode = null
      this.filters = []

      const arrayBuffer = await file.arrayBuffer()
      return await this.audioCtx.decodeAudioData(arrayBuffer)
    } catch (err) {
      throw new Error(
        `Equalizer load failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  preview(buffer: AudioBuffer, bands: EqBand[]): void {
    if (!this.audioCtx) {
      throw new Error('AudioContext is not initialised. Call load() first.')
    }

    // Stop any currently playing source
    try {
      this.sourceNode?.stop()
    } catch {
      // Ignore "already stopped" errors
    }

    this.filters = []

    const source = this.audioCtx.createBufferSource()
    source.buffer = buffer
    this.sourceNode = source

    if (bands.length === 0) {
      source.connect(this.audioCtx.destination)
    } else {
      const filterNodes = bands.map((band) => {
        const filter = this.audioCtx!.createBiquadFilter()
        filter.type = band.type
        filter.frequency.value = band.frequency
        filter.gain.value = band.gain
        return filter
      })

      this.filters = filterNodes

      // Chain: source → filter[0] → filter[1] → ... → destination
      source.connect(filterNodes[0])
      for (let i = 0; i < filterNodes.length - 1; i++) {
        filterNodes[i].connect(filterNodes[i + 1])
      }
      filterNodes[filterNodes.length - 1].connect(this.audioCtx.destination)
    }

    source.start()
  }

  async apply(file: File, bands: EqBand[]): Promise<Blob> {
    try {
      // Decode the source file first with a temporary AudioContext
      const tempCtx = new AudioContext()
      const arrayBuffer = await file.arrayBuffer()
      const buffer = await tempCtx.decodeAudioData(arrayBuffer)
      await tempCtx.close()

      // Render offline with the EQ filters applied
      const offlineCtx = new OfflineAudioContext(
        buffer.numberOfChannels,
        buffer.length,
        buffer.sampleRate
      )

      const source = offlineCtx.createBufferSource()
      source.buffer = buffer

      if (bands.length === 0) {
        source.connect(offlineCtx.destination)
      } else {
        const filterNodes = bands.map((band) => {
          const filter = offlineCtx.createBiquadFilter()
          filter.type = band.type
          filter.frequency.value = band.frequency
          filter.gain.value = band.gain
          return filter
        })

        source.connect(filterNodes[0])
        for (let i = 0; i < filterNodes.length - 1; i++) {
          filterNodes[i].connect(filterNodes[i + 1])
        }
        filterNodes[filterNodes.length - 1].connect(offlineCtx.destination)
      }

      source.start()
      const renderedBuffer = await offlineCtx.startRendering()

      return this.encodeWAV(renderedBuffer)
    } catch (err) {
      throw new Error(
        `Equalizer apply failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }

  stop(): void {
    try {
      this.sourceNode?.stop()
    } catch {
      // Ignore "already stopped" errors
    }
    this.sourceNode = null
    this.filters = []

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {
        // Swallow close errors (context may already be in a closed state)
      })
      this.audioCtx = null
    }
  }

  private encodeWAV(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const numFrames = buffer.length
    const bitsPerSample = 32 // 32-bit float PCM
    const bytesPerSample = bitsPerSample / 8
    const blockAlign = numChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = numFrames * blockAlign
    const headerSize = 44
    const totalSize = headerSize + dataSize

    const arrayBuffer = new ArrayBuffer(totalSize)
    const view = new DataView(arrayBuffer)

    // Helper to write a 4-character chunk ID
    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    // RIFF chunk
    writeStr(0, 'RIFF')
    view.setUint32(4, totalSize - 8, true)
    writeStr(8, 'WAVE')

    // fmt sub-chunk
    writeStr(12, 'fmt ')
    view.setUint32(16, 16, true)          // Subchunk1Size for PCM
    view.setUint16(20, 3, true)           // AudioFormat: 3 = IEEE 754 float
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitsPerSample, true)

    // data sub-chunk
    writeStr(36, 'data')
    view.setUint32(40, dataSize, true)

    // Interleave channel samples
    let offset = 44
    for (let frame = 0; frame < numFrames; frame++) {
      for (let ch = 0; ch < numChannels; ch++) {
        view.setFloat32(offset, buffer.getChannelData(ch)[frame], true)
        offset += 4
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }
}

export const equalizerFacade = new EqualizerFacade()

// Re-export the default EQ band frequencies for convenience
export { DEFAULT_FREQUENCIES as DEFAULT_EQ_FREQUENCIES }
