'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowLeftRight, Scissors, Package, Merge, SlidersHorizontal,
  VolumeX, Gauge, Music, Sunrise, Columns, Wind, FileText,
  Info, Activity, BarChart2, AudioLines, Mic, UserMinus,
  LucideIcon, CheckCircle2, ArrowLeft, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToolStore } from '@/store/tool.store'
import type { Tool } from '@/types/tool.types'
import AudioDropzone from './AudioDropzone'
import WaveformPlayer from './WaveformPlayer'
import ProcessingOverlay from './ProcessingOverlay'
import DownloadDrawer from './DownloadDrawer'
import FileSizeGuard from './FileSizeGuard'
import GuestBanner from './GuestBanner'

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight, Scissors, Package, Merge, SlidersHorizontal,
  VolumeX, Gauge, Music, Sunrise, Columns, Wind, FileText,
  Info, Activity, BarChart2, AudioLines, Mic, UserMinus,
}

function StepRow({ n, label, done = false, active = false }: {
  n: number; label: string; done?: boolean; active?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-colors',
        done ? 'bg-success/20 text-success' : active ? 'bg-brand text-white' : 'bg-bg-border text-text-muted',
      )}>
        {done ? <CheckCircle2 size={11} /> : n}
      </span>
      <span className={cn(
        'text-xs font-semibold uppercase tracking-widest transition-colors',
        done ? 'text-success' : active ? 'text-text-primary' : 'text-text-muted',
      )}>
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

export default function ToolPageLayout({ tool, children, acceptsMultiple = false }: ToolPageLayoutProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const {
    status, progress, progressLabel,
    inputFiles, outputBlob, outputFilename,
    errorMessage, setInputFiles, inputOverlay,
  } = useToolStore()

  const IconComponent = ICON_MAP[tool.icon] ?? Info
  const isProcessing = status === 'processing' || status === 'loading_wasm'
  const isDone = status === 'done'
  const hasInput = inputFiles.length > 0
  const primaryInputFile = inputFiles[0] ?? null

  // Auto-open drawer when processing finishes
  React.useEffect(() => {
    if (isDone && outputBlob) setDrawerOpen(true)
  }, [isDone, outputBlob])

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">

      {/* ── Top bar ── */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-bg-border bg-bg-surface px-3 lg:px-4">
        {/* Back */}
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href="/tools" aria-label="Back to tools">
            <ArrowLeft size={16} />
          </Link>
        </Button>

        {/* Tool icon + name */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/25 to-brand-secondary/25 ring-1 ring-brand/30">
          <IconComponent className="h-3.5 w-3.5 text-brand" />
        </div>
        <div className="flex flex-1 min-w-0 items-baseline gap-2">
          <h1 className="shrink-0 text-sm font-bold text-text-primary">{tool.name}</h1>
          <span className="hidden truncate text-xs text-text-muted sm:block">{tool.description}</span>
        </div>

        {/* Download button — top right */}
        <Button
          size="sm"
          variant={isDone ? 'default' : 'outline'}
          className={cn('gap-1.5 shrink-0 transition-all', isDone && 'shadow-glow')}
          disabled={!isDone || !outputBlob}
          onClick={() => setDrawerOpen(true)}
        >
          <Download size={14} />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">

        {/* ── Left rail ── */}
        <aside className="flex w-full shrink-0 flex-col border-b border-bg-border bg-bg-surface lg:w-[340px] lg:border-b-0 lg:border-r lg:overflow-y-auto">

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
          <section className={cn(
            'flex-1 border-b border-bg-border p-4 transition-opacity',
            !hasInput && 'pointer-events-none opacity-35',
          )}>
            <StepRow n={2} label="Configure" done={isDone} active={hasInput && !isDone} />
            {hasInput ? children : (
              <p className="text-xs text-text-muted">Upload a file above to see options.</p>
            )}
            {errorMessage && (
              <div className="mt-3 rounded-lg border border-error/30 bg-error/10 px-3 py-2.5 text-xs text-error">
                {errorMessage}
              </div>
            )}
          </section>

          {/* Guest banner */}
          {hasInput && (
            <div className="border-b border-bg-border px-4 py-3">
              <GuestBanner />
            </div>
          )}

          {/* Ad space — bottom of rail */}
          <div className="p-3 mt-auto">
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-text-muted/40 select-none">Sponsored</p>
            <div
              className="flex items-center justify-center rounded-lg border border-dashed border-bg-border bg-bg-elevated/20 text-xs text-text-muted/20 select-none"
              style={{ minHeight: 120 }}
              aria-hidden
            >
              {/* google-adsense-slot id="sidebar-300x120" */}
            </div>
          </div>
        </aside>

        {/* ── Right workspace ── */}
        <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 lg:p-5">

          {/* Empty state */}
          {!hasInput && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-bg-border py-24 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated ring-1 ring-bg-border">
                <IconComponent className="h-6 w-6 text-text-muted" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted">No audio loaded</p>
                <p className="mt-1 text-xs text-text-muted/60">
                  Upload a file on the left — it will appear here for preview
                </p>
              </div>
            </div>
          )}

          {/* ── Input track ── */}
          {hasInput && (
            <div className="overflow-hidden rounded-2xl border border-bg-border bg-bg-surface">
              <div className="flex items-center gap-2 border-b border-bg-border/60 bg-bg-elevated/50 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Input</span>
                <span className="ml-1 flex-1 truncate font-mono text-xs text-text-secondary">
                  {primaryInputFile?.name}
                </span>
                {primaryInputFile && (
                  <span className="shrink-0 text-[10px] font-mono text-text-muted">
                    {(primaryInputFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
              </div>
              <div className="p-4">
                <WaveformPlayer
                  blob={primaryInputFile}
                  height={128}
                  overlay={inputOverlay}
                />
              </div>
            </div>
          )}

          {/* ── Processing ── */}
          {isProcessing && (
            <ProcessingOverlay status={status} progress={progress} label={progressLabel} />
          )}

          {/* ── Output track ── */}
          {isDone && outputBlob && (
            <div className="overflow-hidden rounded-2xl border border-brand/30 bg-bg-surface shadow-glow">
              <div className="flex items-center gap-2 border-b border-brand/15 bg-brand/5 px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand">Output</span>
                <span className="ml-1 flex-1 truncate font-mono text-xs text-text-secondary">
                  {outputFilename}
                </span>
                <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                  Ready
                </span>
              </div>
              <div className="p-4">
                <WaveformPlayer blob={outputBlob} height={128} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Download drawer ── */}
      <DownloadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        blob={outputBlob}
        filename={outputFilename}
        toolName={tool.name}
      />
    </div>
  )
}
