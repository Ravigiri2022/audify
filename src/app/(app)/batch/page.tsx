'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Play,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth.store'
import { ffmpegFacade } from '@/facades'
import { formatBytes, downloadBlob } from '@/lib/utils'
import { TOOLS } from '@/lib/constants'
import { SUPPORTED_AUDIO_FORMATS } from '@/lib/constants'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

type JobStatus = 'queued' | 'processing' | 'done' | 'error'

interface BatchJob {
  id: string
  file: File
  status: JobStatus
  progress: number
  outputBlob: Blob | null
  outputFilename: string
  errorMessage: string | null
}

const BATCH_TOOLS = TOOLS.filter(
  (t) => !t.acceptsMultiple && t.slug !== 'recorder' && t.slug !== 'waveform' && t.slug !== 'transcribe'
)

type BatchToolSlug = (typeof BATCH_TOOLS)[number]['slug']

interface ToolOption {
  format?: string
  bitrateKbps?: number
  targetLufs?: number
  speedMultiplier?: number
  semitones?: number
  noiseStrength?: 'low' | 'medium' | 'high'
}

async function runSingleJob(
  file: File,
  toolSlug: BatchToolSlug,
  options: ToolOption
): Promise<{ blob: Blob; filename: string }> {
  const base = file.name.replace(/\.[^/.]+$/, '')
  const ext = file.name.split('.').pop() ?? 'mp3'

  switch (toolSlug) {
    case 'convert': {
      const fmt = options.format ?? 'mp3'
      const blob = await ffmpegFacade.convert(file, fmt, options.bitrateKbps)
      return { blob, filename: `${base}.${fmt}` }
    }
    case 'compress': {
      const blob = await ffmpegFacade.compress(file, options.bitrateKbps ?? 128)
      return { blob, filename: `${base}_compressed.mp3` }
    }
    case 'normalize': {
      const blob = await ffmpegFacade.normalize(file, options.targetLufs ?? -14)
      return { blob, filename: `${base}_normalized.mp3` }
    }
    case 'silence-remove': {
      const blob = await ffmpegFacade.removeSilence(file)
      return { blob, filename: `${base}_no_silence.mp3` }
    }
    case 'noise-remove': {
      const blob = await ffmpegFacade.removeNoise(file, options.noiseStrength ?? 'medium')
      return { blob, filename: `${base}_denoised.mp3` }
    }
    case 'speed': {
      const blob = await ffmpegFacade.changeSpeed(file, options.speedMultiplier ?? 1)
      return { blob, filename: `${base}_${options.speedMultiplier ?? 1}x.mp3` }
    }
    case 'pitch': {
      const sem = options.semitones ?? 0
      const sign = sem >= 0 ? '+' : ''
      const blob = await ffmpegFacade.shiftPitch(file, sem)
      return { blob, filename: `${base}_pitch${sign}${sem}.mp3` }
    }
    case 'stereo-mono': {
      const blob = await ffmpegFacade.stereoToMono(file)
      return { blob, filename: `${base}_mono.mp3` }
    }
    case 'vocal-remove': {
      const blob = await ffmpegFacade.removeVocals(file)
      return { blob, filename: `${base}_instrumental.mp3` }
    }
    case 'trim':
    case 'split':
    case 'fade':
    default: {
      // For tools that need per-file settings, just convert as a fallback
      const blob = await ffmpegFacade.convert(file, ext)
      return { blob, filename: `${base}_processed.${ext}` }
    }
  }
}

export default function BatchPage() {
  const { profile } = useAuthStore()
  const isPro = profile?.plan === 'pro'

  const [jobs, setJobs] = useState<BatchJob[]>([])
  const [selectedTool, setSelectedTool] = useState<BatchToolSlug>('convert')
  const [isRunning, setIsRunning] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  // Shared options
  const [outputFormat, setOutputFormat] = useState('mp3')
  const [bitrateKbps, setBitrateKbps] = useState(128)
  const [targetLufs, setTargetLufs] = useState(-14)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [semitones, setSemitones] = useState(0)
  const [noiseStrength, setNoiseStrength] = useState<'low' | 'medium' | 'high'>('medium')

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(
      (f) =>
        SUPPORTED_AUDIO_FORMATS.includes(f.type) ||
        /\.(mp3|wav|flac|ogg|m4a|aac|opus|webm|mp4|mkv)$/i.test(f.name)
    )
    const newJobs: BatchJob[] = valid.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'queued',
      progress: 0,
      outputBlob: null,
      outputFilename: '',
      errorMessage: null,
    }))
    setJobs((prev) => [...prev, ...newJobs])
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files))
  }

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  const updateJob = (id: string, patch: Partial<BatchJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }

  async function processAll() {
    const queued = jobs.filter((j) => j.status === 'queued')
    if (queued.length === 0) return

    setIsRunning(true)

    try {
      // Load ffmpeg once
      updateJob(queued[0].id, { status: 'processing', progress: 5 })
      await ffmpegFacade.load()
    } catch {
      // already loaded
    }

    const options: ToolOption = {
      format: outputFormat,
      bitrateKbps,
      targetLufs,
      speedMultiplier,
      semitones,
      noiseStrength,
    }

    for (const job of queued) {
      updateJob(job.id, { status: 'processing', progress: 10 })

      try {
        const result = await runSingleJob(job.file, selectedTool, options)
        updateJob(job.id, {
          status: 'done',
          progress: 100,
          outputBlob: result.blob,
          outputFilename: result.filename,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        updateJob(job.id, { status: 'error', errorMessage: msg, progress: 0 })
        toast.error(`Failed: ${job.file.name}`)
      }
    }

    setIsRunning(false)
    toast.success('Batch processing complete')
  }

  function downloadAll() {
    const done = jobs.filter((j) => j.status === 'done' && j.outputBlob)
    done.forEach((j) => downloadBlob(j.outputBlob!, j.outputFilename))
  }

  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={easeOut}
          className="flex flex-col items-center gap-6 rounded-2xl border border-bg-border bg-bg-surface p-10 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/20">
            <Lock className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Batch processing is a Pro feature</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Upgrade to Pro to process multiple files at once and save hours of manual work.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const queuedCount = jobs.filter((j) => j.status === 'queued').length
  const doneCount = jobs.filter((j) => j.status === 'done').length
  const errorCount = jobs.filter((j) => j.status === 'error').length

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={easeOut}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-text-primary">Batch Processing</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Apply the same operation to multiple files at once.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Config panel */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...easeOut, delay: 0.05 }}
          className="space-y-5"
        >
          {/* Dropzone */}
          <label
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 transition-all ${
              isDragOver
                ? 'border-brand bg-brand/5'
                : 'border-bg-border bg-bg-surface hover:border-brand/40 hover:bg-bg-elevated'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <input
              type="file"
              multiple
              className="sr-only"
              accept="audio/*"
              onChange={handleFileInput}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated">
              <Upload className="h-5 w-5 text-text-muted" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">Drop audio files here</p>
              <p className="mt-0.5 text-xs text-text-muted">or click to browse (multiple)</p>
            </div>
          </label>

          {/* Tool selector */}
          <div>
            <Label className="text-sm text-text-secondary mb-1.5 block">Operation</Label>
            <Select
              value={selectedTool}
              onValueChange={(v) => setSelectedTool(v as BatchToolSlug)}
            >
              <SelectTrigger className="bg-bg-surface border-bg-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BATCH_TOOLS.map((t) => (
                  <SelectItem key={t.slug} value={t.slug}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tool-specific options */}
          {selectedTool === 'convert' && (
            <div>
              <Label className="text-sm text-text-secondary mb-1.5 block">Output format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="bg-bg-surface border-bg-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'opus'].map((f) => (
                    <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(selectedTool === 'compress' || selectedTool === 'convert') && (
            <div>
              <Label className="text-sm text-text-secondary mb-1.5 block">
                Bitrate: {bitrateKbps} kbps
              </Label>
              <Slider
                min={32}
                max={320}
                step={8}
                value={[bitrateKbps]}
                onValueChange={([v]) => setBitrateKbps(v)}
              />
            </div>
          )}

          {selectedTool === 'normalize' && (
            <div>
              <Label className="text-sm text-text-secondary mb-1.5 block">
                Target LUFS: {targetLufs}
              </Label>
              <Slider
                min={-30}
                max={-6}
                step={1}
                value={[targetLufs]}
                onValueChange={([v]) => setTargetLufs(v)}
              />
            </div>
          )}

          {selectedTool === 'speed' && (
            <div>
              <Label className="text-sm text-text-secondary mb-1.5 block">
                Speed: {speedMultiplier}x
              </Label>
              <Slider
                min={0.5}
                max={3}
                step={0.1}
                value={[speedMultiplier]}
                onValueChange={([v]) => setSpeedMultiplier(Math.round(v * 10) / 10)}
              />
            </div>
          )}

          {selectedTool === 'pitch' && (
            <div>
              <Label className="text-sm text-text-secondary mb-1.5 block">
                Semitones: {semitones >= 0 ? `+${semitones}` : semitones}
              </Label>
              <Slider
                min={-12}
                max={12}
                step={1}
                value={[semitones]}
                onValueChange={([v]) => setSemitones(v)}
              />
            </div>
          )}

          {selectedTool === 'noise-remove' && (
            <div>
              <Label className="text-sm text-text-secondary mb-1.5 block">Strength</Label>
              <Select
                value={noiseStrength}
                onValueChange={(v) => setNoiseStrength(v as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger className="bg-bg-surface border-bg-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              className="w-full gap-2"
              onClick={processAll}
              disabled={isRunning || queuedCount === 0}
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Processing…' : `Process ${queuedCount || ''} file${queuedCount !== 1 ? 's' : ''}`}
            </Button>

            {doneCount > 0 && (
              <Button variant="outline" className="w-full gap-2" onClick={downloadAll}>
                <Download className="h-4 w-4" />
                Download all ({doneCount})
              </Button>
            )}

            {jobs.length > 0 && (
              <Button
                variant="ghost"
                className="w-full text-text-muted"
                onClick={() => setJobs([])}
                disabled={isRunning}
              >
                Clear queue
              </Button>
            )}
          </div>
        </motion.div>

        {/* Queue table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Queue ({jobs.length})
            </h2>
            {(doneCount > 0 || errorCount > 0) && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                {doneCount > 0 && <span className="text-success">{doneCount} done</span>}
                {errorCount > 0 && <span className="text-error">{errorCount} failed</span>}
              </div>
            )}
          </div>

          {jobs.length === 0 ? (
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={easeOut}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-bg-border py-20 text-center"
            >
              <Clock className="h-8 w-8 text-text-muted" />
              <p className="text-sm text-text-muted">Drop files to start building your queue</p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-2">
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    exit={{ opacity: 0, height: 0 }}
                    transition={easeOut}
                    className="flex items-center gap-3 rounded-xl border border-bg-border bg-bg-surface p-3"
                  >
                    {/* Status icon */}
                    <div className="shrink-0">
                      {job.status === 'queued' && (
                        <Clock className="h-5 w-5 text-text-muted" />
                      )}
                      {job.status === 'processing' && (
                        <Loader2 className="h-5 w-5 text-brand animate-spin" />
                      )}
                      {job.status === 'done' && (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      )}
                      {job.status === 'error' && (
                        <XCircle className="h-5 w-5 text-error" />
                      )}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {job.file.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-xs text-text-muted">{formatBytes(job.file.size)}</span>
                        {job.errorMessage && (
                          <span className="text-xs text-error truncate">{job.errorMessage}</span>
                        )}
                      </div>
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="mt-1.5 h-1" />
                      )}
                    </div>

                    {/* Status badge */}
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs ${
                        job.status === 'done'
                          ? 'border-success/30 text-success'
                          : job.status === 'error'
                          ? 'border-error/30 text-error'
                          : job.status === 'processing'
                          ? 'border-brand/30 text-brand'
                          : 'border-bg-border text-text-muted'
                      }`}
                    >
                      {job.status}
                    </Badge>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      {job.status === 'done' && job.outputBlob && (
                        <button
                          onClick={() => downloadBlob(job.outputBlob!, job.outputFilename)}
                          className="rounded p-1 text-text-muted hover:text-brand transition-colors"
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {job.status !== 'processing' && (
                        <button
                          onClick={() => removeJob(job.id)}
                          className="rounded p-1 text-text-muted hover:text-error transition-colors"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}
