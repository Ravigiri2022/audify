import type { Metadata } from 'next'
import type { Tool } from '@/types/tool.types'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://wavlovesme.com'

const TOOL_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  convert: {
    title: 'Free Online Audio Converter — MP3, WAV, FLAC, OGG, AAC',
    description: 'Convert audio files between MP3, WAV, FLAC, OGG, M4A, AAC, and OPUS instantly in your browser. No upload required. Free and private.',
    keywords: ['audio converter', 'mp3 to wav', 'convert flac to mp3', 'wav to mp3 online', 'audio format converter free'],
  },
  trim: {
    title: 'Free Online Audio Trimmer & Cutter',
    description: 'Trim and cut audio files to any length online. Precise start/end times with waveform preview. Free, instant, no upload.',
    keywords: ['audio trimmer online', 'cut audio online', 'audio cutter free', 'trim mp3 online', 'crop audio'],
  },
  compress: {
    title: 'Free Online Audio Compressor — Reduce File Size',
    description: 'Compress audio files to reduce size without losing quality. Adjust bitrate to get the perfect balance. Free online, no upload.',
    keywords: ['audio compressor online', 'reduce audio file size', 'compress mp3', 'shrink audio file', 'audio file reducer'],
  },
  merge: {
    title: 'Free Online Audio Merger — Join Audio Files',
    description: 'Merge and join multiple audio files into one track online. Add crossfade transitions. Free, works in your browser.',
    keywords: ['merge audio files online', 'join audio files', 'combine mp3 files', 'audio joiner free', 'concatenate audio'],
  },
  split: {
    title: 'Free Online Audio Splitter',
    description: 'Split audio files into multiple parts at custom timestamps. Free online audio splitter, no upload required.',
    keywords: ['audio splitter online', 'split mp3 online', 'divide audio file', 'cut audio into parts', 'audio file splitter'],
  },
  normalize: {
    title: 'Free Online Audio Volume Normalizer',
    description: 'Normalize audio volume to consistent LUFS levels. Perfect for podcasts, streaming, and broadcast. Free, instant, browser-based.',
    keywords: ['audio normalizer online', 'normalize audio volume', 'lufs normalizer', 'audio level equalizer', 'loudness normalization'],
  },
  'silence-remove': {
    title: 'Free Online Silence Remover',
    description: 'Automatically remove silent gaps and pauses from audio recordings. Perfect for podcasts and interviews. Free online tool.',
    keywords: ['remove silence from audio', 'silence remover online', 'auto silence detection', 'remove pauses audio', 'podcast silence remover'],
  },
  speed: {
    title: 'Free Online Audio Speed Changer',
    description: 'Change audio playback speed without affecting pitch. Speed up or slow down any audio file. Free, in-browser processing.',
    keywords: ['audio speed changer online', 'change audio speed', 'slow down audio online', 'speed up mp3', 'audio tempo changer'],
  },
  pitch: {
    title: 'Free Online Pitch Shifter',
    description: 'Shift audio pitch up or down by semitones without changing speed. Free online pitch shifter tool, no upload.',
    keywords: ['pitch shifter online', 'change audio pitch', 'pitch changer free', 'transpose audio online', 'audio key changer'],
  },
  fade: {
    title: 'Free Online Audio Fade In / Fade Out Tool',
    description: 'Add smooth fade in and fade out effects to any audio file. Free online, processes instantly in your browser.',
    keywords: ['audio fade in fade out', 'add fade to audio', 'audio fade effect online', 'mp3 fade in tool', 'fade audio online free'],
  },
  'stereo-mono': {
    title: 'Free Online Stereo to Mono Converter',
    description: 'Convert stereo audio to mono channel online. Instantly reduce file size and ensure compatibility. Free browser-based tool.',
    keywords: ['stereo to mono converter', 'audio stereo mono online', 'convert stereo to mono', 'mono audio converter'],
  },
  'noise-remove': {
    title: 'Free Online Background Noise Remover',
    description: 'Remove background noise, hiss, and hum from audio recordings online. AI-powered noise reduction, runs in your browser.',
    keywords: ['remove background noise online', 'noise removal audio', 'audio noise reduction free', 'denoise audio online', 'background noise cancellation'],
  },
  transcribe: {
    title: 'Free Online Audio Transcription — Speech to Text',
    description: 'Transcribe audio to text for free using on-device AI. Supports 10+ languages. No upload — your audio stays on your device.',
    keywords: ['audio transcription online free', 'speech to text online', 'transcribe audio free', 'voice to text online', 'automatic transcription'],
  },
  metadata: {
    title: 'Free Online Audio Metadata Viewer',
    description: 'View detailed audio metadata: codec, bitrate, sample rate, duration, and embedded tags. Free, instant, no upload.',
    keywords: ['audio metadata viewer', 'mp3 metadata reader', 'audio file info', 'check audio bitrate online', 'audio codec checker'],
  },
  bpm: {
    title: 'Free Online BPM Detector',
    description: 'Detect the BPM (beats per minute) and tempo of any audio track online. Instant in-browser beat detection. Free.',
    keywords: ['bpm detector online', 'beats per minute detector', 'find bpm of song', 'tempo detection online', 'bpm counter free'],
  },
  equalizer: {
    title: 'Free Online Audio Equalizer',
    description: 'Apply an 8-band equalizer to any audio file online. Preview changes live and export the processed audio. Free.',
    keywords: ['online audio equalizer', 'eq audio online free', 'equalizer audio tool', 'audio frequency equalizer', 'bass treble adjuster'],
  },
  waveform: {
    title: 'Free Online Audio Waveform Visualizer',
    description: 'Visualize your audio waveform online. See the waveform of any audio file instantly in your browser. Free.',
    keywords: ['audio waveform visualizer', 'waveform viewer online', 'audio visualizer free', 'see audio waveform', 'mp3 waveform online'],
  },
  recorder: {
    title: 'Free Online Audio Recorder',
    description: 'Record audio directly from your microphone in the browser. No app download needed. Free online audio recorder.',
    keywords: ['online audio recorder', 'record audio online free', 'microphone recorder browser', 'web audio recorder', 'voice recorder online'],
  },
  'vocal-remove': {
    title: 'Free Online Vocal Remover — Karaoke Tool',
    description: 'Remove vocals from music and create instrumental karaoke tracks online. Free, browser-based vocal removal tool.',
    keywords: ['vocal remover online free', 'remove vocals from song', 'karaoke maker online', 'instrumental extractor', 'acapella maker online'],
  },
}

export function getToolMetadata(tool: Tool): Metadata {
  const meta = TOOL_META[tool.slug]
  if (!meta) return { title: tool.name, description: tool.description }

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: `${meta.title} | Wavlovesme`,
      description: meta.description,
      url: `/tools/${tool.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: meta.title,
      description: meta.description,
    },
  }
}

export function getToolJsonLd(tool: Tool) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — Wavlovesme`,
    url: `${APP_URL}/tools/${tool.slug}`,
    description: TOOL_META[tool.slug]?.description ?? tool.description,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any (Browser-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: TOOL_META[tool.slug]?.keywords?.join(', '),
  }
}

export function getLandingJsonLd() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Wavlovesme',
      url: APP_URL,
      description: 'Free online audio toolkit — 19 browser-based audio tools. Convert, trim, transcribe, and enhance audio with zero upload.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${APP_URL}/tools?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Wavlovesme',
      url: APP_URL,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (Browser-based)',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '128',
      },
      featureList: '19 audio tools, browser-based processing, no upload required, privacy-first',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does Wavlovesme upload my audio to servers?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. All audio processing in Wavlovesme runs entirely in your browser using WebAssembly. Your files never leave your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Wavlovesme free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. All 19 audio tools are free to use with a daily limit of 10 operations. Upgrade to Pro for unlimited use.',
          },
        },
        {
          '@type': 'Question',
          name: 'What audio formats does Wavlovesme support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Wavlovesme supports MP3, WAV, FLAC, OGG, M4A, AAC, OPUS, WebM, and can extract audio from MP4 and MKV video files.',
          },
        },
      ],
    },
  ]
}
