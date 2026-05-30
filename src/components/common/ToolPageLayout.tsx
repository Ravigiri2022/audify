'use client'

import {
  ArrowLeftRight, Scissors, Package, Merge, SlidersHorizontal,
  VolumeX, Gauge, Music, Sunrise, Columns, Wind, FileText,
  Info, Activity, BarChart2, AudioLines, Mic, UserMinus,
  LucideIcon, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToolStore } from '@/store/tool.store'
import type { Tool } from '@/types/tool.types'
import AudioDropzone from './AudioDropzone'
import WaveformPlayer from './WaveformPlayer'
import ProcessingOverlay from './ProcessingOverlay'
import DownloadButton from './DownloadButton'
import GuestBanner from './GuestBanner'
import FileSizeGuard from './FileSizeGuard'

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight, Scissors, Package, Merge, SlidersHorizontal,
  VolumeX, Gauge, Music, Sunrise, Columns, Wind, FileText,
  Info, Activity, BarChart2, AudioLines, Mic, UserMinus,
}

function StepRow({
  n, label, done = false, active = false,
}: {
  n: number; label: string; done?: boolean; active?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
          done
            ? 'bg-success/20 text-success'
            : active
            ? 'bg-brand text-white'
            : 'bg-bg-border text-text-muted',
        )}
      >
        {done ? <CheckCircle2 size={12} /> : n}
      </span>
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-widest transition-colors',
          done ? 'text-success' : active ? 'text-text-primary' : 'text-text-muted',
        )}
      >
        {label}
      </span>
    </div>
  )
}

interface ToolPageLayoutProps {
  tool: Tool
  children: React.ReactNode
  acceptsMultiple?: boolean
}

export default function ToolPageLayout({
  tool, children, acceptsMultiple = false,
}: ToolPageLayoutProps) {
  const {
    status, progress, progressLabel,
    inputFiles, outputBlob, outputFilename,
    errorMessage, setInputFiles,
  } = useToolStore()

  const IconComponent = ICON_MAP[tool.icon] ?? Info
  const isProcessing = status === 'processing' || status === 'loading_wasm'
  const isDone = status === 'done'
  const hasInput = inputFiles.length > 0
  const primaryInputFile = inputFiles[0] ?? null

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">

      {/* ── Top bar ── */}
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-bg-border bg-bg-surface px-4 lg:px-6">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/25 to-brand-secondary/25 ring-1 ring-brand/30">
          <IconComponent className="h-3.5 w-3.5 text-brand" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-bold text-text-primary">{tool.name}</h1>
          <span className="hidden text-xs text-text-muted sm:block">{tool.description}</span>
        </div>
      </header>

      {/* ── Body: rail + workspace ── */}
      <div className="flex flex-1 flex-col lg:flex-row">

        {/* ── Left rail ── */}
        <aside className="flex w-full shrink-0 flex-col border-b border-bg-border bg-bg-surface lg:w-[340px] lg:border-b-0 lg:border-r">

          {/* Step 1 — Upload */}
          <section className="border-b border-bg-border p-4">
            <StepRow n={1} label="Upload" done={hasInput} active={!hasInput} />
            <FileSizeGuard fileSize={primaryInputFile?.size ?? null}>
              <AudioDropzone
                onFiles={setInputFiles}
                multiple={acceptsMultiple || tool.acceptsMultiple}
              />
            </FileSizeGuard>
          </section>

          {/* Step 2 — Configure */}
          <section
            className={cn(
              'flex-1 overflow-y-auto border-b border-bg-border p-4 transition-opacity',
              !hasInput && 'pointer-events-none opacity-35',
            )}
          >
            <StepRow
              n={2}
              label="Configure"
              done={isDone}
              active={hasInput && !isDone}
            />
            {hasInput ? (
              children
            ) : (
              <p className="text-xs text-text-muted">
                Upload a file above to see options.
              </p>
            )}
            {errorMessage && (
              <div className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2.5 text-xs text-error">
                {errorMessage}
              </div>
            )}
          </section>

          {/* Step 3 — Download */}
          <section
            className={cn(
              'p-4 transition-opacity',
              !isDone && 'pointer-events-none opacity-35',
            )}
          >
            <StepRow n={3} label="Download result" done={isDone} active={isDone} />
            {isDone && outputBlob ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-lg bg-bg-elevated border border-bg-border px-3 py-2 text-xs text-text-secondary">
                  <span className="font-medium text-text-primary">Ready: </span>
                  <span className="font-mono text-text-muted">{outputFilename}</span>
                </div>
                <DownloadButton blob={outputBlob} filename={outputFilename} />
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                Process your file to get the result here.
              </p>
            )}
          </section>

          {/* Guest banner at rail bottom */}
          {hasInput && (
            <div className="border-t border-bg-border px-4 py-3">
              <GuestBanner />
            </div>
          )}
        </aside>

        {/* ── Right workspace ── */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-6">

          {/* Empty state */}
          {!hasInput && !isProcessing && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-bg-border py-20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-elevated">
                <IconComponent className="h-5 w-5 text-text-muted" />
              </div>
              <p className="text-sm font-medium text-text-muted">
                Drop an audio file to begin
              </p>
              <p className="text-xs text-text-muted opacity-60">
                Your audio will appear here for playback &amp; preview
              </p>
            </div>
          )}

          {/* ── Input track ── */}
          {hasInput && (
            <div className="overflow-hidden rounded-xl border border-bg-border bg-bg-surface">
              <div className="flex items-center gap-2 border-b border-bg-border/60 bg-bg-elevated/40 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                  Input
                </span>
                <span className="ml-1 truncate font-mono text-xs text-text-secondary">
                  {primaryInputFile?.name}
                </span>
                {primaryInputFile && (
                  <span className="ml-auto shrink-0 text-[10px] text-text-muted">
                    {(primaryInputFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
              </div>
              <div className="p-4">
                <WaveformPlayer blob={primaryInputFile} height={120} />
              </div>
            </div>
          )}

          {/* ── Processing bar ── */}
          {isProcessing && (
            <ProcessingOverlay
              status={status}
              progress={progress}
              label={progressLabel}
            />
          )}

          {/* ── Output track ── */}
          {isDone && outputBlob && (
            <div className="overflow-hidden rounded-xl border border-brand/30 bg-bg-surface shadow-glow">
              <div className="flex items-center gap-2 border-b border-brand/15 bg-brand/5 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Output
                </span>
                <span className="ml-1 truncate font-mono text-xs text-text-secondary">
                  {outputFilename}
                </span>
                <span className="ml-auto shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                  Ready
                </span>
              </div>
              <div className="p-4">
                <WaveformPlayer blob={outputBlob} height={120} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
