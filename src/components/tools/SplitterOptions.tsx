'use client'

import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import { useToolStore } from '@/store/tool.store'

interface SplitterOptionsProps {
  onProcess: (timestamps: number[]) => void
  duration?: number
}

export default function SplitterOptions({ onProcess, duration = 0 }: SplitterOptionsProps) {
  const [inputValue, setInputValue] = useState('')
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [inputError, setInputError] = useState('')
  const { setInputOverlay } = useToolStore()

  function syncOverlay(ts: number[]) {
    if (duration > 0 && ts.length > 0) {
      setInputOverlay({ type: 'split', timestamps: ts, duration })
    } else {
      setInputOverlay(null)
    }
  }

  useEffect(() => () => setInputOverlay(null), []) // eslint-disable-line react-hooks/exhaustive-deps

  const addTimestamp = () => {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val <= 0) { setInputError('Enter a positive number of seconds.'); return }
    if (duration > 0 && val >= duration) { setInputError(`Must be less than ${formatDuration(duration)}.`); return }
    if (timestamps.includes(val)) { setInputError('This timestamp already exists.'); return }
    const next = [...timestamps, val].sort((a, b) => a - b)
    setTimestamps(next)
    syncOverlay(next)
    setInputValue('')
    setInputError('')
  }

  const removeTimestamp = (ts: number) => {
    const next = timestamps.filter((t) => t !== ts)
    setTimestamps(next)
    syncOverlay(next)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addTimestamp() }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg bg-bg-elevated/60 border border-bg-border px-3 py-2">
        <p className="text-xs font-semibold text-text-muted mb-1">How to use</p>
        <p className="text-xs text-text-secondary">
          Add timestamps (in seconds) where you want to cut. Each cut line appears on the waveform as you type.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Add split point</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            step={0.1}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setInputError('') }}
            onKeyDown={handleKeyDown}
            placeholder={duration > 0 ? `0 – ${formatDuration(duration)}` : 'seconds'}
            className="flex-1 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <Button type="button" size="icon" variant="secondary" onClick={addTimestamp}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {inputError && <p className="text-xs text-error">{inputError}</p>}
      </div>

      {timestamps.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Cut points ({timestamps.length}) · {timestamps.length + 1} segments
          </p>
          <ul className="flex flex-col gap-1">
            {timestamps.map((ts) => (
              <li key={ts} className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-3 py-2">
                <span className="font-mono text-sm text-text-primary">{formatDuration(ts)}</span>
                <button type="button" onClick={() => removeTimestamp(ts)}
                  className="rounded p-1 text-text-muted hover:bg-bg-border hover:text-error transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={() => onProcess(timestamps)} disabled={timestamps.length === 0} className="w-full">
        Split into {timestamps.length + 1} part{timestamps.length + 1 !== 1 ? 's' : ''}
      </Button>
    </div>
  )
}
