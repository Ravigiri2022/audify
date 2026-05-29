'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'

interface TrimmerOptionsProps {
  onProcess: (start: number, end: number) => void
  duration?: number
}

export default function TrimmerOptions({ onProcess, duration }: TrimmerOptionsProps) {
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(duration ?? 0)

  const handleSubmit = () => {
    if (end <= start) return
    onProcess(start, end)
  }

  return (
    <div className="flex flex-col gap-5">
      {duration !== undefined && duration > 0 && (
        <p className="text-xs text-text-muted">
          Total duration: <span className="font-medium text-text-primary">{formatDuration(duration)}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="trim-start" className="text-sm font-medium text-text-primary">
            Start (seconds)
          </label>
          <input
            id="trim-start"
            type="number"
            min={0}
            max={duration}
            step={0.1}
            value={start}
            onChange={(e) => setStart(Math.max(0, Number(e.target.value)))}
            className="rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="trim-end" className="text-sm font-medium text-text-primary">
            End (seconds)
          </label>
          <input
            id="trim-end"
            type="number"
            min={0}
            max={duration}
            step={0.1}
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
            className="rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {end > 0 && end > start && (
        <p className="text-xs text-text-muted">
          Trimmed duration:{' '}
          <span className="font-medium text-text-primary">{formatDuration(end - start)}</span>
        </p>
      )}

      {end <= start && start > 0 && (
        <p className="text-xs text-error">End time must be greater than start time.</p>
      )}

      <Button onClick={handleSubmit} disabled={end <= start} className="w-full">
        Trim Audio
      </Button>
    </div>
  )
}
