'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'

interface SplitterOptionsProps {
  onProcess: (timestamps: number[]) => void
}

export default function SplitterOptions({ onProcess }: SplitterOptionsProps) {
  const [inputValue, setInputValue] = useState('')
  const [timestamps, setTimestamps] = useState<number[]>([])
  const [inputError, setInputError] = useState('')

  const addTimestamp = () => {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val <= 0) {
      setInputError('Enter a positive number of seconds.')
      return
    }
    if (timestamps.includes(val)) {
      setInputError('This timestamp already exists.')
      return
    }
    setTimestamps((prev) => [...prev, val].sort((a, b) => a - b))
    setInputValue('')
    setInputError('')
  }

  const removeTimestamp = (ts: number) => {
    setTimestamps((prev) => prev.filter((t) => t !== ts))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTimestamp()
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Split Points (seconds)</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            step={0.1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setInputError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 30 or 90.5"
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
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Split points ({timestamps.length})
          </p>
          <ul className="flex flex-col gap-1">
            {timestamps.map((ts) => (
              <li
                key={ts}
                className="flex items-center justify-between rounded-lg border border-bg-border bg-bg-elevated px-3 py-2"
              >
                <span className="text-sm text-text-primary">{formatDuration(ts)}</span>
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
          <p className="text-xs text-text-muted">
            Will produce {timestamps.length + 1} audio segments.
          </p>
        </div>
      )}

      <Button
        onClick={() => onProcess(timestamps)}
        disabled={timestamps.length === 0}
        className="w-full"
      >
        Split into {timestamps.length + 1} Parts
      </Button>
    </div>
  )
}
