'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'

interface TrimmerOptionsProps {
  onProcess: (start: number, end: number) => void
  duration?: number
}

export default function TrimmerOptions({ onProcess, duration = 0 }: TrimmerOptionsProps) {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(duration)

  useEffect(() => {
    if (duration > 0) setEnd(duration)
  }, [duration])

  const trimmedDuration = Math.max(0, end - start)
  const isValid = end > start && duration > 0
  const startPct = duration > 0 ? (start / duration) * 100 : 0
  const endPct = duration > 0 ? (end / duration) * 100 : 100

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg bg-bg-elevated/60 border border-bg-border px-3 py-2">
        <p className="text-xs font-semibold text-text-muted mb-1">How to use</p>
        <p className="text-xs text-text-secondary">
          Drag the <span className="text-brand font-medium">Start</span> and{' '}
          <span className="text-brand font-medium">End</span> sliders to select the region you want to keep. Everything outside is discarded.
        </p>
      </div>

      {duration > 0 ? (
        <>
          {/* Visual timeline */}
          <div className="relative h-10 rounded-lg bg-bg-elevated overflow-hidden select-none">
            <div
              className="absolute inset-y-0 left-0 bg-bg-border/40"
              style={{ width: `${startPct}%` }}
            />
            <div
              className="absolute inset-y-0 border-x-2 border-brand bg-brand/10"
              style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
            />
            <div
              className="absolute inset-y-0 bg-bg-border/40"
              style={{ left: `${endPct}%`, right: 0 }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
              <span className="text-[10px] font-mono text-text-muted">{formatDuration(0)}</span>
              <span className="text-[10px] font-mono text-brand font-semibold">{formatDuration(trimmedDuration)} kept</span>
              <span className="text-[10px] font-mono text-text-muted">{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Start slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Start</span>
              <span className="font-mono text-brand">{formatDuration(start)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={start}
              onChange={(e) => {
                const v = Number(e.target.value)
                setStart(Math.min(v, end - 0.1))
              }}
              className="w-full accent-brand"
            />
          </div>

          {/* End slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">End</span>
              <span className="font-mono text-brand">{formatDuration(end)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={end}
              onChange={(e) => {
                const v = Number(e.target.value)
                setEnd(Math.max(v, start + 0.1))
              }}
              className="w-full accent-brand"
            />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-bg-elevated border border-bg-border px-3 py-2 text-center">
            <div>
              <p className="text-[10px] text-text-muted uppercase">Start</p>
              <p className="text-sm font-mono font-semibold text-text-primary">{formatDuration(start)}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase">Kept</p>
              <p className="text-sm font-mono font-semibold text-brand">{formatDuration(trimmedDuration)}</p>
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase">End</p>
              <p className="text-sm font-mono font-semibold text-text-primary">{formatDuration(end)}</p>
            </div>
          </div>
        </>
      ) : (
        <p className="text-xs text-text-muted">Upload an audio file to see the trim controls.</p>
      )}

      <Button onClick={() => onProcess(start, end)} disabled={!isValid} className="w-full">
        Trim · Keep {formatDuration(trimmedDuration)}
      </Button>
    </div>
  )
}
