'use client'

import * as React from 'react'
import { X, Download, FileAudio, Shield, Clock } from 'lucide-react'
import { cn, downloadBlob } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DownloadDrawerProps {
  open: boolean
  onClose: () => void
  blob: Blob | null
  filename: string
  toolName: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export function DownloadDrawer({ open, onClose, blob, filename, toolName }: DownloadDrawerProps) {
  const ext = filename.split('.').pop()?.toUpperCase() ?? '—'
  const size = blob ? formatBytes(blob.size) : '—'

  // Close on Escape
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 bottom-0 z-50 flex w-80 flex-col border-l border-bg-border bg-bg-surface shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal
        aria-label="Download result"
      >
        {/* Header */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-bg-border px-4">
          <div className="flex items-center gap-2">
            <Download size={14} className="text-brand" />
            <span className="text-sm font-semibold text-text-primary">Download Result</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">

          {/* File card */}
          <div className="rounded-xl border border-bg-border bg-bg-elevated p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 ring-1 ring-brand/20">
                <FileAudio className="h-5 w-5 text-brand" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{filename}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  <Clock size={10} className="inline mr-1" />
                  Processed with {toolName}
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-bg-border pt-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Format</p>
                <p className="mt-1 font-mono text-base font-bold text-text-primary">{ext}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">File size</p>
                <p className="mt-1 font-mono text-base font-bold text-text-primary">{size}</p>
              </div>
            </div>
          </div>

          {/* Primary download */}
          <Button
            size="lg"
            className="w-full gap-2 text-base"
            onClick={() => blob && downloadBlob(blob, filename)}
            disabled={!blob}
          >
            <Download size={16} />
            Download {ext}
          </Button>

          {/* Privacy note */}
          <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/5 px-3 py-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <p className="text-xs leading-relaxed text-text-secondary">
              This file was processed entirely in your browser using WebAssembly.
              Nothing was uploaded or sent to any server.
            </p>
          </div>

          {/* Ad space inside drawer */}
          <div className="mt-auto">
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-text-muted/40">Sponsored</p>
            <div
              className="flex items-center justify-center rounded-lg border border-dashed border-bg-border bg-bg-elevated/30 text-xs text-text-muted/25 select-none"
              style={{ height: 100 }}
            >
              {/* google-adsense-slot id="drawer-300x100" */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default DownloadDrawer
