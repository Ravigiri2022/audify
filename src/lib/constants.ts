import type { Tool } from '@/types/tool.types'

export const TOOLS: Tool[] = [
  { slug: 'convert',       name: 'Format Converter',   description: 'Convert between MP3, WAV, FLAC, OGG, M4A, AAC, OPUS and more.',    category: 'Convert',  icon: 'ArrowLeftRight' },
  { slug: 'trim',          name: 'Audio Trimmer',       description: 'Cut and trim your audio to any length with precision.',             category: 'Edit',     icon: 'Scissors' },
  { slug: 'compress',      name: 'Audio Compressor',    description: 'Reduce file size by adjusting bitrate without losing quality.',     category: 'Edit',     icon: 'Package' },
  { slug: 'merge',         name: 'Audio Merger',        description: 'Join multiple audio files into a single track.',                    category: 'Edit',     icon: 'Merge', acceptsMultiple: true },
  { slug: 'split',         name: 'Audio Splitter',      description: 'Split one audio file into multiple parts.',                         category: 'Edit',     icon: 'Scissors' },
  { slug: 'normalize',     name: 'Volume Normalizer',   description: 'Balance audio levels to a consistent LUFS target.',                category: 'Enhance',  icon: 'SlidersHorizontal' },
  { slug: 'silence-remove',name: 'Silence Remover',     description: 'Automatically strip silent gaps from your recording.',             category: 'Enhance',  icon: 'VolumeX' },
  { slug: 'speed',         name: 'Speed Changer',       description: 'Speed up or slow down audio without changing pitch.',              category: 'Edit',     icon: 'Gauge' },
  { slug: 'pitch',         name: 'Pitch Shifter',       description: 'Shift the pitch up or down by semitones.',                         category: 'Enhance',  icon: 'Music' },
  { slug: 'fade',          name: 'Fade In / Out',       description: 'Add smooth fade in and/or fade out effects.',                      category: 'Edit',     icon: 'Sunrise' },
  { slug: 'stereo-mono',   name: 'Stereo to Mono',      description: 'Convert stereo audio to a single mono channel.',                   category: 'Convert',  icon: 'Columns' },
  { slug: 'noise-remove',  name: 'Noise Remover',       description: 'Reduce background hiss, hum, and noise from recordings.',         category: 'Enhance',  icon: 'Wind' },
  { slug: 'transcribe',    name: 'Transcription',       description: 'Convert speech to text using on-device AI. No data leaves your browser.', category: 'Analyze', icon: 'FileText' },
  { slug: 'metadata',      name: 'Metadata Viewer',     description: 'Inspect codec, bitrate, sample rate, and embedded tags.',         category: 'Analyze',  icon: 'Info' },
  { slug: 'bpm',           name: 'BPM Detector',        description: 'Detect the tempo and beats per minute of any audio track.',        category: 'Analyze',  icon: 'Activity' },
  { slug: 'equalizer',     name: 'Equalizer',           description: 'Fine-tune frequencies with an 8-band EQ and live preview.',       category: 'Enhance',  icon: 'BarChart2' },
  { slug: 'waveform',      name: 'Waveform Visualizer', description: 'Visualize your audio waveform and export it as a PNG.',           category: 'Analyze',  icon: 'AudioLines' },
  { slug: 'recorder',      name: 'Audio Recorder',      description: 'Record audio directly from your microphone in the browser.',      category: 'Create',   icon: 'Mic' },
  { slug: 'vocal-remove',  name: 'Vocal Remover',       description: 'Isolate the instrumental by removing center-panned vocals.',      category: 'Enhance',  icon: 'UserMinus' },
]

export const TOOL_CATEGORIES = ['Convert', 'Edit', 'Enhance', 'Analyze', 'Create'] as const

export const FFMPEG_CORE_URL = '/ffmpeg/ffmpeg-core.js'
export const FFMPEG_WASM_URL = '/ffmpeg/ffmpeg-core.wasm'

export const SUPPORTED_AUDIO_FORMATS = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
  'audio/flac', 'audio/ogg', 'audio/aac', 'audio/mp4',
  'audio/m4a', 'audio/opus', 'audio/webm',
  'video/mp4', 'video/webm', 'video/mkv',
]

export const AUDIO_FORMATS = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'opus'] as const
export type AudioFormat = typeof AUDIO_FORMATS[number]
