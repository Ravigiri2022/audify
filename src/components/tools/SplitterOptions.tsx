'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, Play, Pause, Download, CheckSquare, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, formatDuration, downloadBlob } from '@/lib/utils'
import { useToolStore } from '@/store/tool.store'

export interface SplitSegment {
  blob: Blob
  filename: string
  index: number
  startTime: number
  endTime: number
}

interface SplitterOptionsProps {
  onProcess: (timestamps: number[]) => void
  duration?: number
  results?: SplitSegment[]
}

// ── Mini audio preview ────────────────────────────────────────────────────────

function SegmentPlayer({ blob }: { blob: Blob }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(blob)
    urlRef.current = url
    return () => {
      audioRef.current?.pause()
      URL.revokeObjectURL(url)
    }
  }, [blob])

  function toggle() {
    if (!urlRef.current) return
    if (!audioRef.current) {
      audioRef.current = new Audio(urlRef.current)
      audioRef.current.addEventListener('ended', () => setPlaying(false))
      audioRef.current.addEventListener('pause', () => setPlaying(false))
    }
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-elevated hover:bg-bg-border transition-colors"
      aria-label={playing ? 'Pause preview' : 'Play preview'}
    >
      {playing
        ? <Pause size={11} className="text-brand" />
        : <Play size={11} className="text-text-muted" />
      }
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function SplitterOptions({
  onProcess, duration = 0, results,
}: SplitterOptionsProps) {
  const [inputValue, setInputValue] = useState('')
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [inputError, setInputError] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const { setInputOverlay } = useToolStore()

  // Select all segments by default when results arrive
  useEffect(() => {
    if (results && results.length > 0) {
      setSelected(new Set(results.map((r) => r.index)))
    }
  }, [results])

  function syncOverlay(ts: number[]) {
    if (duration > 0 && ts.length > 0) {
      setInputOverlay({ type: 'split', timestamps: ts, duration })
    } else {
      setInputOverlay(null)
    }
  }

  useEffect(() => () => setInputOverlay(null), []) // eslint-disable-line react-hooks/exhaustive-deps

  function addTimestamp() {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val <= 0) { setInputError('Enter a positive number of seconds.'); return }
    if (duration > 0 && val >= duration) {
      setInputError(`Must be less than ${formatDuration(duration)}.`); return
    }
    if (timestamps.includes(val)) { setInputError('This timestamp already exists.'); return }
    const next = [...timestamps, val].sort((a, b) => a - b)
    setTimestamps(next)
    syncOverlay(next)
    setInputValue('')
    setInputError('')
  }

  function removeTimestamp(ts: number) {
    const next = timestamps.filter((t) => t !== ts)
    setTimestamps(next)
    syncOverlay(next)
  }

  function toggleSegment(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(results?.map((r) => r.index) ?? []))
  }

  function selectNone() {
    setSelected(new Set())
  }

  function downloadSelected() {
    if (!results) return
    results
      .filter((r) => selected.has(r.index))
      .forEach((r) => downloadBlob(r.blob, r.filename))
  }

  const segCount = timestamps.length + 1

  return (
    <div className="flex flex-col gap-5">

      {/* How to use */}
      <div className="rounded-lg bg-bg-elevated/60 border border-bg-border px-3 py-2">
        <p className="text-xs font-semibold text-text-muted mb-1">How to use</p>
        <p className="text-xs text-text-secondary">
          Add timestamps where you want to cut — they appear as lines on the waveform.
          After splitting, pick which segments to keep and download.
        </p>
      </div>

      {/* Add split point */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Add split point</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            step={0.1}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setInputError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTimestamp() } }}
            placeholder={duration > 0 ? `0 – ${formatDuration(duration)}` : 'seconds'}
            className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <Button type="button" size="icon" variant="secondary" onClick={addTimestamp}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {inputError && <p className="text-xs text-error">{inputError}</p>}
      </div>

      {/* Cut point list */}
      {timestamps.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Cut points ({timestamps.length}) · {segCount} segments
          </p>
          <ul className="flex flex-col gap-1">
            {timestamps.map((ts) => (
              <li key={ts} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-3 py-1.5">
                <span className="font-mono text-sm text-text-primary">{formatDuration(ts)}</span>
                <button
                  type="button"
                  onClick={() => removeTimestamp(ts)}
                  className="rounded p-1 text-text-muted hover:bg-bg-border hover:text-error transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Split button */}
      <Button onClick={() => onProcess(timestamps)} disabled={timestamps.length === 0} className="w-full">
        Split into {segCount} part{segCount !== 1 ? 's' : ''}
      </Button>

      {/* ── Results ── */}
      {results && results.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-bg-border pt-4">
          {/* Header + bulk actions */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Results · {results.length} segments
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={selectAll}
                className="rounded px-2 py-1 text-[10px] font-semibold text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
              >
                All
              </button>
              <button
                type="button"
                onClick={selectNone}
                className="rounded px-2 py-1 text-[10px] font-semibold text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
              >
                None
              </button>
            </div>
          </div>

          {/* Segment list */}
          <ul className="flex flex-col gap-1.5">
            {results.map((seg) => {
              const isChecked = selected.has(seg.index)
              const segDuration = seg.endTime - seg.startTime
              return (
                <li
                  key={seg.index}
                  onClick={() => toggleSegment(seg.index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors',
                    isChecked
                      ? 'border-brand/40 bg-brand/5'
                      : 'border-bg-border bg-bg-elevated opacity-50 hover:opacity-75',
                  )}
                >
                  {/* Checkbox */}
                  <span className="shrink-0 text-brand">
                    {isChecked
                      ? <CheckSquare size={15} />
                      : <Square size={15} className="text-text-muted" />
                    }
                  </span>

                  {/* Label */}
                  <span className="flex h-5 w-10 shrink-0 items-center justify-center rounded bg-bg-elevated text-[10px] font-bold text-text-muted">
                    Part {seg.index + 1}
                  </span>

                  {/* Time range */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-text-primary">
                      {formatDuration(seg.startTime)} → {formatDuration(seg.endTime)}
                    </p>
                    <p className="text-[10px] text-text-muted">{formatDuration(segDuration)}</p>
                  </div>

                  {/* Play + individual download */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SegmentPlayer blob={seg.blob} />
                    <button
                      type="button"
                      onClick={() => downloadBlob(seg.blob, seg.filename)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-elevated hover:bg-bg-border transition-colors"
                      aria-label={`Download ${seg.filename}`}
                    >
                      <Download size={11} className="text-text-muted" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Download selected */}
          <Button
            onClick={downloadSelected}
            disabled={selected.size === 0}
            className="w-full gap-2"
          >
            <Download size={14} />
            Download {selected.size} of {results.length} segment{results.length !== 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  )
}
