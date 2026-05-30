const BPM_MIN = 50
const BPM_MAX = 210

class BpmFacade {
  async detect(file: File): Promise<{ bpm: number; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer()

      // Decode to mono PCM at whatever the file's native sample rate is
      const audioCtx = new OfflineAudioContext(1, 1, 44100)
      let audioBuffer: AudioBuffer
      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      } catch (err) {
        throw new Error(`Audio decode failed: ${err instanceof Error ? err.message : String(err)}`)
      }

      const sampleRate = audioBuffer.sampleRate
      const rawSamples = audioBuffer.getChannelData(0)

      // Analyse only the first 30 seconds — enough for stable BPM, keeps it fast
      const ANALYZE_SECONDS = 30
      const samples = rawSamples.subarray(
        0,
        Math.min(rawSamples.length, Math.floor(sampleRate * ANALYZE_SECONDS)),
      )

      // ── Step 1: RMS energy envelope ──────────────────────────────────────
      // FRAME ~23ms, HOP ~5.8ms @ 44100Hz → ~172 frames/sec
      const FRAME   = 1024
      const HOP     = 256
      const nFrames = Math.floor((samples.length - FRAME) / HOP)

      if (nFrames < 50) return { bpm: 0, confidence: 0 }

      const energy = new Float32Array(nFrames)
      for (let f = 0; f < nFrames; f++) {
        const start = f * HOP
        let sq = 0
        for (let i = 0; i < FRAME; i++) sq += samples[start + i] ** 2
        energy[f] = Math.sqrt(sq / FRAME)
      }

      // ── Step 2: Smooth energy (3-frame moving average) ───────────────────
      const SMOOTH = 3
      const smoothed = new Float32Array(nFrames)
      for (let f = SMOOTH; f < nFrames - SMOOTH; f++) {
        let s = 0
        for (let j = -SMOOTH; j <= SMOOTH; j++) s += energy[f + j]
        smoothed[f] = s / (2 * SMOOTH + 1)
      }

      // ── Step 3: Onset strength = half-wave-rectified energy flux ─────────
      // Captures beat attacks without being fooled by single waveform peaks
      const onset = new Float32Array(nFrames)
      for (let f = 1; f < nFrames; f++) {
        onset[f] = Math.max(0, smoothed[f] - smoothed[f - 1])
      }

      // Normalise so autocorrelation values are comparable across files
      let maxO = 0
      for (let f = 0; f < nFrames; f++) if (onset[f] > maxO) maxO = onset[f]
      if (maxO > 0) for (let f = 0; f < nFrames; f++) onset[f] /= maxO

      // ── Step 4: Autocorrelation over the BPM lag range ───────────────────
      const fps    = sampleRate / HOP
      const minLag = Math.max(2, Math.floor(fps * 60 / BPM_MAX))
      const maxLag = Math.ceil(fps * 60 / BPM_MIN)
      const nLags  = maxLag - minLag + 1

      const autocorr = new Float32Array(nLags)
      for (let li = 0; li < nLags; li++) {
        const lag = minLag + li
        const n   = nFrames - lag
        let s = 0
        for (let i = 0; i < n; i++) s += onset[i] * onset[i + lag]
        autocorr[li] = s / n
      }

      // ── Step 5: Find dominant lag ─────────────────────────────────────────
      let bestIdx = 0
      for (let li = 1; li < nLags; li++) {
        if (autocorr[li] > autocorr[bestIdx]) bestIdx = li
      }
      const bestCorr = autocorr[bestIdx]
      const bestLag  = minLag + bestIdx
      const lagSec   = bestLag / fps
      let bpm        = 60 / lagSec

      // Fold into valid range (handles octave doublings/halvings)
      while (bpm < BPM_MIN && bpm * 2 <= BPM_MAX) bpm *= 2
      while (bpm > BPM_MAX && bpm / 2 >= BPM_MIN) bpm /= 2
      bpm = Math.round(Math.max(BPM_MIN, Math.min(BPM_MAX, bpm)))

      // ── Step 6: Confidence = how much the peak exceeds the mean ──────────
      let meanC = 0
      for (let li = 0; li < nLags; li++) meanC += autocorr[li]
      meanC /= nLags

      const confidence = meanC > 0
        ? Math.min(1, Math.max(0, (bestCorr - meanC) / meanC))
        : 0

      return { bpm, confidence: parseFloat(confidence.toFixed(2)) }

    } catch (err) {
      throw new Error(`BPM detection failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

export const bpmFacade = new BpmFacade()
