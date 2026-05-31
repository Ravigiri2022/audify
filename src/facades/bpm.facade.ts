class BpmFacade {
  async detect(file: File): Promise<{ bpm: number; confidence: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer()

      // Decode to mono PCM — OfflineAudioContext is just used for decodeAudioData
      const audioCtx = new OfflineAudioContext(1, 1, 44100)
      let audioBuffer: AudioBuffer
      try {
        audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      } catch (err) {
        throw new Error(`Audio decode failed: ${err instanceof Error ? err.message : String(err)}`)
      }

      // Limit to first 60 s to keep processing fast (~2.6M samples at 44100 Hz)
      const ANALYZE_SECONDS = 60
      const sampleRate = audioBuffer.sampleRate
      const raw = audioBuffer.getChannelData(0)
      const samples = raw.length > sampleRate * ANALYZE_SECONDS
        ? raw.subarray(0, Math.floor(sampleRate * ANALYZE_SECONDS))
        : raw

      // music-tempo: Scheirer (1998) algorithm with multi-band onset detection
      // Far more accurate than hand-rolled autocorrelation — handles kick/snare
      // alternation, sub-beats and harmonic ambiguity correctly.
      const MusicTempo = (await import('music-tempo')).default
      const mt = new MusicTempo(samples as unknown as Float32Array)

      const bpm = Math.round(mt.tempo)

      // Confidence proxy: how many beats were found relative to expected count
      const expectedBeats = (samples.length / sampleRate / 60) * mt.tempo
      const confidence = expectedBeats > 0
        ? Math.min(1, mt.beats.length / expectedBeats)
        : 0

      return { bpm, confidence: parseFloat(confidence.toFixed(2)) }
    } catch (err) {
      throw new Error(`BPM detection failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
}

export const bpmFacade = new BpmFacade()
