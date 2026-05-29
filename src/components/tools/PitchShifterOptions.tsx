'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PitchShifterOptionsProps {
  onProcess: (semitones: number) => void
}

function semitoneLabel(semitones: number): string {
  if (semitones === 0) return 'Original pitch'
  const sign = semitones > 0 ? '+' : ''
  const octaves = Math.abs(semitones) / 12
  if (Math.abs(semitones) === 12) return `${sign}${semitones} st (1 octave ${semitones > 0 ? 'up' : 'down'})`
  if (octaves > 0.5 && Math.abs(semitones) > 6) return `${sign}${semitones} st (${semitones > 0 ? 'higher' : 'lower'})`
  return `${sign}${semitones} semitone${Math.abs(semitones) !== 1 ? 's' : ''}`
}

export default function PitchShifterOptions({ onProcess }: PitchShifterOptionsProps) {
  const [semitones, setSemitones] = useState(0)

  const displayValue = semitones > 0 ? `+${semitones}` : String(semitones)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Pitch Shift</label>
          <span className="text-sm tabular-nums text-brand">{displayValue} st</span>
        </div>
        <input
          type="range"
          min={-12}
          max={12}
          step={1}
          value={semitones}
          onChange={(e) => setSemitones(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>-12 (octave down)</span>
          <span>+12 (octave up)</span>
        </div>
      </div>

      <div className="rounded-lg bg-bg-elevated px-4 py-3 text-center">
        <p className="text-2xl font-bold text-brand">{displayValue}</p>
        <p className="text-xs text-text-muted">{semitoneLabel(semitones)}</p>
      </div>

      <div className="flex gap-2">
        {[-12, -6, 0, +6, +12].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setSemitones(v)}
            className={[
              'flex-1 rounded-lg border py-1.5 text-xs font-medium transition-colors',
              semitones === v
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-brand/40',
            ].join(' ')}
          >
            {v > 0 ? `+${v}` : v}
          </button>
        ))}
      </div>

      <Button onClick={() => onProcess(semitones)} className="w-full">
        Shift Pitch {displayValue === '0' ? '(no change)' : `by ${displayValue} st`}
      </Button>
    </div>
  )
}
