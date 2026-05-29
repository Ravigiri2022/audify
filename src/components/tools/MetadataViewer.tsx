'use client'

import { Music2, Info } from 'lucide-react'
import { formatBytes, formatDuration } from '@/lib/utils'
import type { AudioMetadata } from '@/types/tool.types'

interface MetadataViewerProps {
  metadata: AudioMetadata | null
}

function MetaRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-xs font-medium text-text-muted">{label}</span>
      <span className="truncate text-right text-xs text-text-primary">{String(value)}</span>
    </div>
  )
}

export default function MetadataViewer({ metadata }: MetadataViewerProps) {
  if (!metadata) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-bg-border bg-bg-surface px-6 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated">
          <Info className="h-5 w-5 text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">Load an audio file to view its metadata.</p>
      </div>
    )
  }

  const channelLabel = metadata.channels === 1 ? '1 (Mono)' : metadata.channels === 2 ? '2 (Stereo)' : String(metadata.channels)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-xl border border-bg-border bg-bg-surface p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
          <Music2 className="h-5 w-5 text-brand" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {metadata.title ?? 'Unknown Title'}
          </p>
          <p className="text-xs text-text-muted">
            {metadata.artist ?? 'Unknown Artist'}
            {metadata.album ? ` — ${metadata.album}` : ''}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-bg-border bg-bg-surface">
        <div className="border-b border-bg-border px-4 py-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            Technical Info
          </p>
        </div>
        <div className="divide-y divide-bg-border px-4">
          <MetaRow label="Format" value={metadata.format.toUpperCase()} />
          <MetaRow label="Codec" value={metadata.codec} />
          <MetaRow label="Duration" value={formatDuration(metadata.duration)} />
          <MetaRow label="Bitrate" value={`${metadata.bitrate} kbps`} />
          <MetaRow label="Sample Rate" value={`${metadata.sampleRate.toLocaleString()} Hz`} />
          <MetaRow label="Channels" value={channelLabel} />
          <MetaRow label="File Size" value={formatBytes(metadata.fileSize)} />
        </div>
      </div>

      {(metadata.title || metadata.artist || metadata.album || metadata.year || metadata.genre) && (
        <div className="rounded-xl border border-bg-border bg-bg-surface">
          <div className="border-b border-bg-border px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Tags
            </p>
          </div>
          <div className="divide-y divide-bg-border px-4">
            <MetaRow label="Title" value={metadata.title} />
            <MetaRow label="Artist" value={metadata.artist} />
            <MetaRow label="Album" value={metadata.album} />
            <MetaRow label="Year" value={metadata.year} />
            <MetaRow label="Genre" value={metadata.genre} />
          </div>
        </div>
      )}
    </div>
  )
}
