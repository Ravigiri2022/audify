import type { FFmpeg } from '@ffmpeg/ffmpeg'
import { FFMPEG_CORE_URL, FFMPEG_WASM_URL } from '@/lib/constants'

// fetchFile is browser-only; loaded lazily alongside FFmpeg
let fetchFile: (file: File) => Promise<Uint8Array>

class FFmpegFacade {
  private ffmpeg: FFmpeg | null = null
  private loaded = false

  async load(onProgress?: (p: number) => void): Promise<void> {
    if (this.loaded) return

    try {
      const [{ FFmpeg }, util] = await Promise.all([
        import('@ffmpeg/ffmpeg'),
        import('@ffmpeg/util'),
      ])
      fetchFile = util.fetchFile

      this.ffmpeg = new FFmpeg()

      if (onProgress) {
        this.ffmpeg.on('progress', ({ progress }) => {
          onProgress(progress * 100)
        })
      }

      await this.ffmpeg.load({ coreURL: FFMPEG_CORE_URL, wasmURL: FFMPEG_WASM_URL })
      this.loaded = true
    } catch (err) {
      this.ffmpeg = null
      this.loaded = false
      throw new Error(`FFmpeg failed to load: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  isLoaded(): boolean {
    return this.loaded
  }

  private get instance(): FFmpeg {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error('FFmpeg is not loaded. Call ffmpegFacade.load() first.')
    }
    return this.ffmpeg
  }

  private ext(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() ?? 'mp3'
  }

  async convert(input: File, outputFormat: string, bitrate?: number): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = `output.${outputFormat}`

    try {
      await ff.writeFile(inName, await fetchFile(input))

      const args = ['-i', inName]
      if (bitrate) {
        args.push('-b:a', `${bitrate}k`)
      }
      args.push(outName)

      await ff.exec(args)

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Convert failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async trim(input: File, start: number, end: number): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = `output.${inExt}`

    try {
      await ff.writeFile(inName, await fetchFile(input))
      await ff.exec(['-i', inName, '-ss', String(start), '-to', String(end), '-c', 'copy', outName])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Trim failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async compress(input: File, bitrateKbps: number): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))
      await ff.exec(['-i', inName, '-b:a', `${bitrateKbps}k`, outName])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Compress failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async merge(inputs: File[], crossfadeSec?: number): Promise<Blob> {
    const ff = this.instance

    try {
      const inNames: string[] = []
      for (let i = 0; i < inputs.length; i++) {
        const name = `input${i}.${this.ext(inputs[i])}`
        await ff.writeFile(name, await fetchFile(inputs[i]))
        inNames.push(name)
      }

      const outName = 'output.mp3'
      let args: string[]

      if (crossfadeSec && crossfadeSec > 0 && inputs.length >= 2) {
        // Build amix filter with acrossfade between consecutive pairs
        const filterParts: string[] = []
        let prevLabel = '[0:a]'

        for (let i = 1; i < inNames.length; i++) {
          const outLabel = i < inNames.length - 1 ? `[cf${i}]` : '[outa]'
          filterParts.push(
            `${prevLabel}[${i}:a]acrossfade=d=${crossfadeSec}:c1=tri:c2=tri${outLabel}`
          )
          prevLabel = `[cf${i}]`
        }

        const inputArgs = inNames.flatMap((n) => ['-i', n])
        args = [...inputArgs, '-filter_complex', filterParts.join(';'), '-map', '[outa]', outName]
      } else {
        // Simple concat
        const concatList = inNames.map((n) => `file '${n}'`).join('\n')
        await ff.writeFile('concat.txt', concatList)
        args = ['-f', 'concat', '-safe', '0', '-i', 'concat.txt', '-c', 'copy', outName]
      }

      await ff.exec(args)

      const data = await ff.readFile(outName)

      for (const n of inNames) await ff.deleteFile(n)
      if (crossfadeSec && crossfadeSec > 0) {
        // concat.txt not written in crossfade path
      } else {
        await ff.deleteFile('concat.txt')
      }
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Merge failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async split(input: File, timestamps: number[]): Promise<Blob[]> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`

    try {
      await ff.writeFile(inName, await fetchFile(input))

      const segments = timestamps.length === 0
        ? []
        : [0, ...timestamps]

      const blobs: Blob[] = []

      for (let i = 0; i < segments.length; i++) {
        const start = segments[i]
        const end = segments[i + 1]
        const outName = `output_${i}.mp3`

        const args = ['-i', inName, '-ss', String(start)]
        if (end !== undefined) args.push('-to', String(end))
        args.push('-c', 'copy', outName)

        await ff.exec(args)

        const data = await ff.readFile(outName)
        blobs.push(new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' }))
        await ff.deleteFile(outName)
      }

      await ff.deleteFile(inName)
      return blobs
    } catch (err) {
      throw new Error(`Split failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async normalize(input: File, targetLufs = -14): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))
      await ff.exec([
        '-i', inName,
        '-af', `loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`,
        outName,
      ])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Normalize failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async removeSilence(input: File, thresholdDb = -40, minDuration = 0.5): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))
      await ff.exec([
        '-i', inName,
        '-af', `silenceremove=stop_periods=-1:stop_duration=${minDuration}:stop_threshold=${thresholdDb}dB`,
        outName,
      ])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Remove silence failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async changeSpeed(input: File, multiplier: number): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))

      // atempo only accepts 0.5–2.0; chain filters for values outside that range
      const filters: string[] = []
      let remaining = multiplier

      while (remaining > 2.0) {
        filters.push('atempo=2.0')
        remaining /= 2.0
      }
      while (remaining < 0.5) {
        filters.push('atempo=0.5')
        remaining /= 0.5
      }
      filters.push(`atempo=${remaining.toFixed(4)}`)

      await ff.exec(['-i', inName, '-af', filters.join(','), outName])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Change speed failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async shiftPitch(input: File, semitones: number): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))

      // Shift pitch via sample rate manipulation + atempo compensation
      const rateMultiplier = Math.pow(2, semitones / 12)
      const originalRate = 44100
      const newRate = Math.round(originalRate * rateMultiplier)
      const atempoCompensation = (1 / rateMultiplier).toFixed(4)

      await ff.exec([
        '-i', inName,
        '-af', `asetrate=${newRate},aresample=${originalRate},atempo=${atempoCompensation}`,
        outName,
      ])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Shift pitch failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async fade(input: File, fadeInSec: number, fadeOutSec: number, durationSec?: number): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))

      const filters: string[] = []

      if (fadeInSec > 0) {
        filters.push(`afade=t=in:st=0:d=${fadeInSec}`)
      }

      if (fadeOutSec > 0 && durationSec !== undefined) {
        const fadeOutStart = durationSec - fadeOutSec
        filters.push(`afade=t=out:st=${fadeOutStart}:d=${fadeOutSec}`)
      } else if (fadeOutSec > 0) {
        // Without known duration, rely on -sseof trick
        filters.push(`afade=t=out:st=-${fadeOutSec}:d=${fadeOutSec}`)
      }

      const afArg = filters.join(',')
      const args = ['-i', inName]
      if (afArg) args.push('-af', afArg)
      args.push(outName)

      await ff.exec(args)

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Fade failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async stereoToMono(input: File): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))
      await ff.exec(['-i', inName, '-ac', '1', outName])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Stereo to mono failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async removeNoise(input: File, strength: 'low' | 'medium' | 'high'): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    const sigmaMap: Record<typeof strength, number> = {
      low: 5,
      medium: 12,
      high: 20,
    }
    const sigma = sigmaMap[strength]

    try {
      await ff.writeFile(inName, await fetchFile(input))
      await ff.exec(['-i', inName, '-af', `afftdn=nf=-${sigma}`, outName])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Remove noise failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async removeVocals(input: File): Promise<Blob> {
    const ff = this.instance
    const inExt = this.ext(input)
    const inName = `input.${inExt}`
    const outName = 'output.mp3'

    try {
      await ff.writeFile(inName, await fetchFile(input))
      // Phase cancellation: subtract centre-panned (shared L+R) content
      await ff.exec([
        '-i', inName,
        '-af', 'pan=stereo|c0=c0-c1|c1=c1-c0',
        outName,
      ])

      const data = await ff.readFile(outName)
      await ff.deleteFile(inName)
      await ff.deleteFile(outName)

      return new Blob([data as unknown as ArrayBuffer], { type: 'audio/mpeg' })
    } catch (err) {
      throw new Error(`Remove vocals failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  terminate(): void {
    this.ffmpeg?.terminate()
    this.ffmpeg = null
    this.loaded = false
  }
}

export const ffmpegFacade = new FFmpegFacade()
