declare module 'music-tempo' {
  interface MusicTempoParams {
    maxBPM?: number
    minBPM?: number
  }

  class MusicTempo {
    tempo: number
    beats: number[]
    constructor(audioData: Float32Array | number[], params?: MusicTempoParams)
  }

  export = MusicTempo
}
