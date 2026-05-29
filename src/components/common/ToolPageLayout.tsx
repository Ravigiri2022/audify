'use client'

import {
  ArrowLeftRight, Scissors, Package, Merge, SlidersHorizontal,
  VolumeX, Gauge, Music, Sunrise, Columns, Wind, FileText,
  Info, Activity, BarChart2, AudioLines, Mic, UserMinus,
  LucideIcon,
} from 'lucide-react'
import { useToolStore } from '@/store/tool.store'
import type { Tool } from '@/types/tool.types'
import AudioDropzone from './AudioDropzone'
import WaveformPlayer from './WaveformPlayer'
import ProcessingOverlay from './ProcessingOverlay'
import DownloadButton from './DownloadButton'
import GuestBanner from './GuestBanner'
import FileSizeGuard from './FileSizeGuard'

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Scissors,
  Package,
  Merge,
  SlidersHorizontal,
  VolumeX,
  Gauge,
  Music,
  Sunrise,
  Columns,
  Wind,
  FileText,
  Info,
  Activity,
  BarChart2,
  AudioLines,
  Mic,
  UserMinus,
}

interface ToolPageLayoutProps {
  tool: Tool
  children: React.ReactNode
  acceptsMultiple?: boolean
}

export default function ToolPageLayout({
  tool,
  children,
  acceptsMultiple = false,
}: ToolPageLayoutProps) {
  const {
    status,
    progress,
    progressLabel,
    inputFiles,
    outputBlob,
    outputFilename,
    errorMessage,
    setInputFiles,
  } = useToolStore()

  const IconComponent = ICON_MAP[tool.icon] ?? Info
  const isProcessing = status === 'processing' || status === 'loading_wasm'
  const isDone = status === 'done'
  const hasInput = inputFiles.length > 0
  const primaryInputFile = inputFiles[0] ?? null

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand-secondary/20 ring-1 ring-brand/30">
            <IconComponent className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{tool.name}</h1>
            <p className="mt-1 text-sm text-text-secondary">{tool.description}</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left column: dropzone + options */}
          <div className="flex flex-col gap-4">
            <FileSizeGuard fileSize={primaryInputFile?.size ?? null}>
              <AudioDropzone
                onFiles={setInputFiles}
                multiple={acceptsMultiple || tool.acceptsMultiple}
              />
            </FileSizeGuard>

            {hasInput && (
              <div className="rounded-xl border border-bg-border bg-bg-surface p-4">
                {children}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                {errorMessage}
              </div>
            )}
          </div>

          {/* Right column: waveform players + processing overlay */}
          <div className="flex flex-col gap-4">
            {hasInput && (
              <div className="rounded-xl border border-bg-border bg-bg-surface p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                  Input
                </p>
                <WaveformPlayer blob={primaryInputFile} />
              </div>
            )}

            {isProcessing && (
              <ProcessingOverlay status={status} progress={progress} label={progressLabel} />
            )}

            {isDone && outputBlob && (
              <div className="rounded-xl border border-brand/30 bg-bg-surface p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                  Output
                </p>
                <WaveformPlayer blob={outputBlob} label={outputFilename} />
              </div>
            )}
          </div>
        </div>

        {/* Below grid: download + guest banner */}
        {(isDone || hasInput) && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
            {isDone && outputBlob && (
              <DownloadButton blob={outputBlob ?? null} filename={outputFilename} />
            )}
            <GuestBanner />
          </div>
        )}
      </div>
    </div>
  )
}
