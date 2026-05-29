const BPM_MIN = 40
const BPM_MAX = 240
const PEAK_THRESHOLD_RATIO = 0.3
const BIN_WIDTH_MS = 5

class BpmFacade {
  async detect(file: File): Promise<{ bpm: number; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer()

      // Decode audio to PCM samples using an OfflineAudioContext
      const audioCtx = new OfflineAudioContext(1, 1, 44100)
      let audioBuffer: AudioBuffer

      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      } catch (err) {
        throw new Error(
          `Audio decode failed: ${err instanceof Error ? err.message : String(err)}`
        )
      }

      const sampleRate = audioBuffer.sampleRate
      const channelData = audioBuffer.getChannelData(0)

      // Find the peak amplitude to establish the dynamic threshold
      let maxAmplitude = 0
      for (let i = 0; i < channelData.length; i++) {
        const abs = Math.abs(channelData[i])
        if (abs > maxAmplitude) maxAmplitude = abs
      }

      const threshold = PEAK_THRESHOLD_RATIO * maxAmplitude

      // Collect peak positions (sample indices), enforcing a minimum spacing
      // of 100ms between peaks to avoid double-counting transients
      const minPeakSpacingSamples = Math.floor(sampleRate * 0.1)
      const peaks: number[] = []
      let lastPeakIndex = -minPeakSpacingSamples

      for (let i = 1; i < channelData.length - 1; i++) {
        const v = channelData[i]
        if (
          v > threshold &&
          v >= channelData[i - 1] &&
          v >= channelData[i + 1] &&
          i - lastPeakIndex >= minPeakSpacingSamples
        ) {
          peaks.push(i)
          lastPeakIndex = i
        }
      }

      if (peaks.length < 2) {
        return { bpm: 0, confidence: 0 }
      }

      // Compute inter-peak intervals in milliseconds
      const intervals: number[] = []
      for (let i = 1; i < peaks.length; i++) {
        const intervalMs = ((peaks[i] - peaks[i - 1]) / sampleRate) * 1000
        intervals.push(intervalMs)
      }

      // Build a histogram of intervals with BIN_WIDTH_MS-wide bins
      const histogram = new Map<number, number>()
      for (const ms of intervals) {
        const bin = Math.round(ms / BIN_WIDTH_MS) * BIN_WIDTH_MS
        histogram.set(bin, (histogram.get(bin) ?? 0) + 1)
      }

      // Find the dominant bin
      let dominantBin = 0
      let dominantCount = 0
      histogram.forEach((count, bin) => {
        if (count > dominantCount) {
          dominantCount = count
          dominantBin = bin
        }
      })

      if (dominantBin === 0) {
        return { bpm: 0, confidence: 0 }
      }

      // Average the intervals that fall in the dominant bin (±half bin width)
      const halfBin = BIN_WIDTH_MS / 2
      const matchingIntervals = intervals.filter(
        (ms) => Math.abs(ms - dominantBin) <= halfBin
      )
      const avgIntervalMs =
        matchingIntervals.reduce((sum, v) => sum + v, 0) / matchingIntervals.length

      const rawBpm = 60000 / avgIntervalMs

      // Fold octave doublings/halvings into the valid BPM range
      let bpm = rawBpm
      while (bpm < BPM_MIN && bpm * 2 <= BPM_MAX) bpm *= 2
      while (bpm > BPM_MAX && bpm / 2 >= BPM_MIN) bpm /= 2

      bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(bpm)))

      const confidence = Math.min(1, dominantCount / intervals.length)

      return { bpm, confidence: parseFloat(confidence.toFixed(2)) }
    } catch (err) {
      throw new Error(
        `BPM detection failed: ${err instanceof Error ? err.message : String(err)}`
      )
    }
  }
}

export const bpmFacade = new BpmFacade()
