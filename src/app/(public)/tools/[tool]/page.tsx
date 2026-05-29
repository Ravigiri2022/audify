'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import ToolPageLayout from '@/components/common/ToolPageLayout'
import { TOOLS } from '@/lib/constants'
import type { ToolSlug } from '@/types/tool.types'
import type { AudioMetadata } from '@/types/tool.types'
import { useToolStore } from '@/store/tool.store'
import { ffmpegFacade, whisperFacade, metadataFacade, bpmFacade, equalizerFacade } from '@/facades'

// Tool options components
import ConverterOptions from '@/components/tools/ConverterOptions'
import TrimmerOptions from '@/components/tools/TrimmerOptions'
import CompressorOptions from '@/components/tools/CompressorOptions'
import MergerOptions from '@/components/tools/MergerOptions'
import SplitterOptions from '@/components/tools/SplitterOptions'
import NormalizerOptions from '@/components/tools/NormalizerOptions'
import SilenceRemoverOptions from '@/components/tools/SilenceRemoverOptions'
import SpeedChangerOptions from '@/components/tools/SpeedChangerOptions'
import PitchShifterOptions from '@/components/tools/PitchShifterOptions'
import FadeOptions from '@/components/tools/FadeOptions'
import StereoMonoOptions from '@/components/tools/StereoMonoOptions'
import NoiseRemoverOptions from '@/components/tools/NoiseRemoverOptions'
import TranscriptionOptions from '@/components/tools/TranscriptionOptions'
import MetadataViewer from '@/components/tools/MetadataViewer'
import BpmResult from '@/components/tools/BpmResult'
import EqualizerOptions from '@/components/tools/EqualizerOptions'
import WaveformOptions from '@/components/tools/WaveformOptions'
import RecorderOptions from '@/components/tools/RecorderOptions'
import VocalRemoverOptions from '@/components/tools/VocalRemoverOptions'
import { fadeUp, easeOut } from '@/lib/motion'

// ── Helper: ensure ffmpeg is loaded ─────────────────────────────────────────
async function ensureFFmpeg(
  setStatus: (s: 'loading_wasm' | 'processing') => void,
  setProgress: (p: number, label?: string) => void
) {
  setStatus('loading_wasm')
  setProgress(0, 'Loading audio engine…')
  try {
    await ffmpegFacade.load((p) => setProgress(p * 0.8, 'Loading audio engine…'))
  } catch {
    // already loaded — ignore
  }
  setStatus('processing')
  setProgress(0, 'Processing…')
}

// ── Per-tool options panels ──────────────────────────────────────────────────

function ConvertPanel() {
  const store = useToolStore()
  return (
    <ConverterOptions
      onProcess={async (format, bitrate) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.convert(store.inputFiles[0], format, bitrate)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_converted.${format}`)
      }}
    />
  )
}

function TrimPanel() {
  const store = useToolStore()
  return (
    <TrimmerOptions
      onProcess={async (start, end) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.trim(store.inputFiles[0], start, end)
        const ext = store.inputFiles[0].name.split('.').pop() ?? 'mp3'
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_trimmed.${ext}`)
      }}
    />
  )
}

function CompressPanel() {
  const store = useToolStore()
  return (
    <CompressorOptions
      onProcess={async (bitrateKbps) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.compress(store.inputFiles[0], bitrateKbps)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_compressed.mp3`)
      }}
    />
  )
}

function MergePanel() {
  const store = useToolStore()
  return (
    <MergerOptions
      onProcess={async (crossfadeSec) => {
        if (store.inputFiles.length < 2) { store.setError('Add at least 2 files to merge'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.merge(store.inputFiles, crossfadeSec || undefined)
        store.setResult(blob, 'merged_output.mp3')
      }}
    />
  )
}

function SplitPanel() {
  const store = useToolStore()
  return (
    <SplitterOptions
      onProcess={async (timestamps) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blobs = await ffmpegFacade.split(store.inputFiles[0], timestamps)
        // Download each segment and report the first as the "result"
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        blobs.forEach((blob, i) => {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `${base}_part${i + 1}.mp3`
          a.click()
          setTimeout(() => URL.revokeObjectURL(a.href), 1000)
        })
        store.setResult(blobs[0], `${base}_part1.mp3`)
      }}
    />
  )
}

function NormalizePanel() {
  const store = useToolStore()
  return (
    <NormalizerOptions
      onProcess={async (targetLufs) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.normalize(store.inputFiles[0], targetLufs)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_normalized.mp3`)
      }}
    />
  )
}

function SilenceRemovePanel() {
  const store = useToolStore()
  return (
    <SilenceRemoverOptions
      onProcess={async (thresholdDb, minDuration) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.removeSilence(store.inputFiles[0], thresholdDb, minDuration)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_silence_removed.mp3`)
      }}
    />
  )
}

function SpeedPanel() {
  const store = useToolStore()
  return (
    <SpeedChangerOptions
      onProcess={async (multiplier) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.changeSpeed(store.inputFiles[0], multiplier)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_${multiplier}x.mp3`)
      }}
    />
  )
}

function PitchPanel() {
  const store = useToolStore()
  return (
    <PitchShifterOptions
      onProcess={async (semitones) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.shiftPitch(store.inputFiles[0], semitones)
        const sign = semitones >= 0 ? '+' : ''
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_pitch${sign}${semitones}.mp3`)
      }}
    />
  )
}

function FadePanel() {
  const store = useToolStore()
  return (
    <FadeOptions
      onProcess={async (fadeInSec, fadeOutSec) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.fade(store.inputFiles[0], fadeInSec, fadeOutSec)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_faded.mp3`)
      }}
    />
  )
}

function StereoMonoPanel() {
  const store = useToolStore()
  return (
    <StereoMonoOptions
      onProcess={async () => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.stereoToMono(store.inputFiles[0])
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_mono.mp3`)
      }}
    />
  )
}

function NoiseRemovePanel() {
  const store = useToolStore()
  return (
    <NoiseRemoverOptions
      onProcess={async (strength) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.removeNoise(store.inputFiles[0], strength)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_denoised.mp3`)
      }}
    />
  )
}

function TranscribePanel() {
  const store = useToolStore()
  return (
    <TranscriptionOptions
      onProcess={async (modelSize, language) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        store.setStatus('processing')
        store.setProgress(0, 'Loading Whisper model…')
        await whisperFacade.load(modelSize, (p, label) => store.setProgress(p, label))
        store.setProgress(50, 'Transcribing…')
        const result = await whisperFacade.transcribe(
          store.inputFiles[0],
          language || undefined
        )
        const blob = new Blob([result.text], { type: 'text/plain' })
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_transcript.txt`)
      }}
    />
  )
}

function MetadataPanel() {
  const store = useToolStore()
  const [metadata, setMetadata] = useState<AudioMetadata | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const file = store.inputFiles[0] ?? null

  useEffect(() => {
    if (!file) { setMetadata(null); return }
    setLoading(true)
    setError(null)
    store.setStatus('processing')
    metadataFacade
      .read(file)
      .then((meta) => {
        setMetadata(meta)
        store.setStatus('idle')
        store.setProgress(100)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
        store.setStatus('idle')
      })
      .finally(() => setLoading(false))
  }, [file]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          Reading metadata…
        </div>
      )}
      {error && <p className="text-sm text-error">{error}</p>}
      <MetadataViewer metadata={metadata} />
    </div>
  )
}

function BpmPanel() {
  const store = useToolStore()
  const [bpm, setBpm] = useState<number | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const file = store.inputFiles[0] ?? null

  async function detect() {
    if (!file) return
    setLoading(true)
    setError(null)
    setBpm(null)
    setConfidence(null)
    store.setStatus('processing')
    store.setProgress(10, 'Detecting BPM…')
    try {
      const result = await bpmFacade.detect(file)
      setBpm(result.bpm)
      setConfidence(result.confidence)
      store.setProgress(100)
      store.setStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      store.setStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={detect}
        disabled={!file || loading}
        className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {loading ? 'Detecting…' : 'Detect BPM'}
      </button>
      {error && <p className="text-sm text-error">{error}</p>}
      <BpmResult bpm={bpm} confidence={confidence} />
    </div>
  )
}

function EqualizerPanel() {
  const store = useToolStore()
  return (
    <EqualizerOptions
      onProcess={async (bands) => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        store.setStatus('processing')
        store.setProgress(10, 'Applying equalizer…')
        const blob = await equalizerFacade.apply(store.inputFiles[0], bands)
        store.setProgress(100)
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_eq.wav`)
      }}
    />
  )
}

function RecorderPanel() {
  const store = useToolStore()
  return (
    <RecorderOptions
      onRecordingComplete={(blob) => {
        const filename = `recording_${new Date().toISOString().slice(0, 10)}.webm`
        store.setResult(blob, filename)
        store.setInputFiles([new File([blob], filename, { type: blob.type })])
      }}
    />
  )
}

function VocalRemovePanel() {
  const store = useToolStore()
  return (
    <VocalRemoverOptions
      onProcess={async () => {
        if (!store.inputFiles[0]) { store.setError('No file selected'); return }
        await ensureFFmpeg(store.setStatus, store.setProgress)
        const blob = await ffmpegFacade.removeVocals(store.inputFiles[0])
        const base = store.inputFiles[0].name.replace(/\.[^/.]+$/, '')
        store.setResult(blob, `${base}_instrumental.mp3`)
      }}
    />
  )
}

// ── Panel map ────────────────────────────────────────────────────────────────
const PANEL_MAP: Record<ToolSlug, React.FC> = {
  convert: ConvertPanel,
  trim: TrimPanel,
  compress: CompressPanel,
  merge: MergePanel,
  split: SplitPanel,
  normalize: NormalizePanel,
  'silence-remove': SilenceRemovePanel,
  speed: SpeedPanel,
  pitch: PitchPanel,
  fade: FadePanel,
  'stereo-mono': StereoMonoPanel,
  'noise-remove': NoiseRemovePanel,
  transcribe: TranscribePanel,
  metadata: MetadataPanel,
  bpm: BpmPanel,
  equalizer: EqualizerPanel,
  waveform: WaveformOptions,
  recorder: RecorderPanel,
  'vocal-remove': VocalRemovePanel,
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ToolPage() {
  const params = useParams<{ tool: string }>()
  const router = useRouter()
  const reset = useToolStore((s) => s.reset)

  const tool = TOOLS.find((t) => t.slug === (params.tool as ToolSlug))

  useEffect(() => {
    if (!tool) {
      router.replace('/tools')
      return
    }
    return () => {
      reset()
    }
  }, [tool, router, reset])

  if (!tool) return null

  const PanelComponent = PANEL_MAP[tool.slug as ToolSlug]

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />
      <ToolPageLayout tool={tool} acceptsMultiple={tool.acceptsMultiple}>
        {PanelComponent ? (
          <motion.div
            key={tool.slug}
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={easeOut}
          >
            <PanelComponent />
          </motion.div>
        ) : null}
      </ToolPageLayout>
      <Footer />
    </div>
  )
}
