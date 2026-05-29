export type ToolSlug =
  | 'convert'
  | 'trim'
  | 'compress'
  | 'merge'
  | 'split'
  | 'normalize'
  | 'silence-remove'
  | 'speed'
  | 'pitch'
  | 'fade'
  | 'stereo-mono'
  | 'noise-remove'
  | 'transcribe'
  | 'metadata'
  | 'bpm'
  | 'equalizer'
  | 'waveform'
  | 'recorder'
  | 'vocal-remove'

export type ToolCategory = 'Convert' | 'Edit' | 'Enhance' | 'Analyze' | 'Create'

export type ToolStatus = 'idle' | 'loading_wasm' | 'processing' | 'done' | 'error'

export interface Tool {
  slug: ToolSlug
  name: string
  description: string
  category: ToolCategory
  icon: string
  acceptsMultiple?: boolean
  proOnly?: boolean
}

export interface TranscriptionChunk {
  start: number
  end: number
  text: string
}

export interface TranscriptionResult {
  text: string
  chunks: TranscriptionChunk[]
  srt: string
  vtt: string
}

export interface AudioMetadata {
  format: string
  codec: string
  duration: number
  bitrate: number
  sampleRate: number
  channels: number
  fileSize: number
  title?: string
  artist?: string
  album?: string
  year?: number
  genre?: string
}

export interface EqBand {
  frequency: number
  gain: number
  type: BiquadFilterType
}
