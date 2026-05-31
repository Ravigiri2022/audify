const BPM_MIN = 50
const BPM_MAX = 210

/**
 * Gaussian tempo prior: peaks at ~110 BPM (typical pop/rock centre).
 * Penalises low tempos like 52 BPM so the half-tempo ambiguity
 * (kick-snare 2-beat pattern producing stronger 2× correlation)
 * is resolved in favour of the musical beat.
 */
function tempoPrior(bpm: number): number {
  return Math.exp(-((bpm - 110) ** 2) / (2 * 40 ** 2))
}

class BpmFacade {
  async detect(file: File): Promise<{ bpm: number; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer()

      const audioCtx = new OfflineAudioContext(1, 1, 44100)
      let audioBuffer: AudioBuffer
      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      } catch (err) {
        throw new Error(`Audio decode failed: ${err instanceof Error ? err.message : String(err)}`)
      }

      const sampleRate = audioBuffer.sampleRate
      const rawSamples = audioBuffer.getChannelData(0)

      // Only analyse the first 30 s for speed
      const ANALYZE_SECONDS = 30
      const samples = rawSamples.subarray(
        0,
        Math.min(rawSamples.length, Math.floor(sampleRate * ANALYZE_SECONDS)),
      )

      // ── Step 1: RMS energy envelope ──────────────────────────────────────
      const FRAME   = 1024   // ~23 ms @ 44100 Hz
      const HOP     = 256    // ~5.8 ms → ~172 frames / sec
      const nFrames = Math.floor((samples.length - FRAME) / HOP)
      if (nFrames < 50) return { bpm: 0, confidence: 0 }

      const energy = new Float32Array(nFrames)
      for (let f = 0; f < nFrames; f++) {
        const start = f * HOP
        let sq = 0
        for (let i = 0; i < FRAME; i++) sq += samples[start + i] ** 2
        energy[f] = Math.sqrt(sq / FRAME)
      }

      // ── Step 2: Smooth + onset strength (half-wave energy flux) ──────────
      const SMOOTH = 3
      const smoothed = new Float32Array(nFrames)
      for (let f = SMOOTH; f < nFrames - SMOOTH; f++) {
        let s = 0
        for (let j = -SMOOTH; j <= SMOOTH; j++) s += energy[f + j]
        smoothed[f] = s / (2 * SMOOTH + 1)
      }

      const onset = new Float32Array(nFrames)
      for (let f = 1; f < nFrames; f++) {
        onset[f] = Math.max(0, smoothed[f] - smoothed[f - 1])
      }

      let maxO = 0
      for (let f = 0; f < nFrames; f++) if (onset[f] > maxO) maxO = onset[f]
      if (maxO > 0) for (let f = 0; f < nFrames; f++) onset[f] /= maxO

      // ── Step 3: Autocorrelation over an extended lag range ────────────────
      // We compute out to 2× maxLag so the harmonic enhancement can look up
      // the 2× period contribution without going out of bounds.
      const fps     = sampleRate / HOP
      const minLag  = Math.max(2, Math.floor(fps * 60 / BPM_MAX))
      const maxLag  = Math.ceil(fps * 60 / BPM_MIN)
      const extLag  = maxLag * 2  // extended ceiling for harmonic lookup

      const autocorr = new Float32Array(extLag + 1)
      for (let lag = minLag; lag <= extLag; lag++) {
        const n = nFrames - lag
        if (n <= 0) break
        let s = 0
        for (let i = 0; i < n; i++) s += onset[i] * onset[i + lag]
        autocorr[lag] = s / n
      }

      // ── Step 4: Enhanced autocorrelation × tempo prior ───────────────────
      //
      // Why this fixes the 2× ambiguity:
      //   Many tracks have stronger autocorr at 2T (half BPM) than at T (true
      //   BPM) because the kick-snare alternation creates a 2-beat energy
      //   pattern. EAC adds 0.5 × autocorr[2T] to the score at T, so the
      //   true beat period "inherits" the strong 2× correlation and wins.
      //   The tempo prior further penalises unnatural tempos (< 70 BPM).
      //
      const nLags = maxLag - minLag + 1
      const score = new Float32Array(nLags)
      for (let li = 0; li < nLags; li++) {
        const lag    = minLag + li
        const harm2  = lag * 2 <= extLag ? autocorr[lag * 2] : 0
        const eac    = autocorr[lag] + 0.5 * harm2
        score[li]    = eac * tempoPrior(60 / (lag / fps))
      }

      // ── Step 5: Best scoring lag ──────────────────────────────────────────
      let bestIdx = 0
      for (let li = 1; li < nLags; li++) {
        if (score[li] > score[bestIdx]) bestIdx = li
      }
      const bestLag  = minLag + bestIdx
      const bestCorr = autocorr[bestLag]
      let bpm        = 60 / (bestLag / fps)

      // Fold residual octave errors into BPM range
      while (bpm < BPM_MIN && bpm * 2 <= BPM_MAX) bpm *= 2
      while (bpm > BPM_MAX && bpm / 2 >= BPM_MIN) bpm /= 2
      bpm = Math.round(Math.max(BPM_MIN, Math.min(BPM_MAX, bpm)))

      // ── Step 6: Confidence ────────────────────────────────────────────────
      let meanC = 0
      for (let lag = minLag; lag <= maxLag; lag++) meanC += autocorr[lag]
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
