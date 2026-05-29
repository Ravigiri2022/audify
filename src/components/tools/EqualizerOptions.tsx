'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DEFAULT_EQ_FREQUENCIES } from '@/facades'
import type { EqBand } from '@/types/tool.types'

interface EqualizerOptionsProps {
  onProcess: (bands: EqBand[]) => void
}

const BAND_TYPES: BiquadFilterType[] = [
  'lowshelf',   // 60 Hz
  'peaking',    // 170 Hz
  'peaking',    // 310 Hz
  'peaking',    // 600 Hz
  'peaking',    // 1000 Hz
  'peaking',    // 3000 Hz
  'peaking',    // 6000 Hz
  'highshelf',  // 16000 Hz
]

const EQ_PRESETS: Record<string, number[]> = {
  Flat:         [0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [8, 6, 4, 2, 0, 0, 0, 0],
  'Treble Boost': [0, 0, 0, 0, 2, 4, 6, 8],
  Vocal:        [-2, -2, 2, 6, 6, 4, 2, -2],
}

function buildBands(gains: number[]): EqBand[] {
  return DEFAULT_EQ_FREQUENCIES.map((frequency, i) => ({
    frequency,
    gain: gains[i],
    type: BAND_TYPES[i],
  }))
}

function formatFreq(hz: number): string {
  if (hz >= 1000) return `${hz / 1000}k`
  return String(hz)
}

export default function EqualizerOptions({ onProcess }: EqualizerOptionsProps) {
  const [gains, setGains] = useState<number[]>(DEFAULT_EQ_FREQUENCIES.map(() => 0))
  const [activePreset, setActivePreset] = useState<string | null>('Flat')

  const setGain = (index: number, value: number) => {
    setGains((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    setActivePreset(null)
  }

  const applyPreset = (name: string) => {
    setGains([...EQ_PRESETS[name]])
    setActivePreset(name)
  }

  const handleApply = () => {
    onProcess(buildBands(gains))
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Preset buttons */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Presets</label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(EQ_PRESETS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => applyPreset(name)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                activePreset === name
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-brand/40'
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* 8-band vertical sliders */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Bands</label>
        <div className="flex items-end justify-between gap-1">
          {DEFAULT_EQ_FREQUENCIES.map((freq, i) => (
            <div key={freq} className="flex flex-1 flex-col items-center gap-1.5">
              <span
                className={cn(
                  'text-xs tabular-nums font-medium',
                  gains[i] > 0 ? 'text-brand' : gains[i] < 0 ? 'text-error' : 'text-text-muted'
                )}
              >
                {gains[i] > 0 ? `+${gains[i]}` : gains[i]}
              </span>
              <div className="relative flex h-28 items-center justify-center">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={1}
                  value={gains[i]}
                  onChange={(e) => setGain(i, Number(e.target.value))}
                  className="accent-brand"
                  style={{
                    writingMode: 'vertical-lr',
                    direction: 'rtl',
                    width: '28px',
                    height: '112px',
                    cursor: 'pointer',
                  }}
                  aria-label={`${formatFreq(freq)} Hz gain`}
                />
              </div>
              <span className="text-xs text-text-muted">{formatFreq(freq)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-text-muted mt-1">
          <span>-12 dB</span>
          <span>0 dB</span>
          <span>+12 dB</span>
        </div>
      </div>

      <Button onClick={handleApply} className="w-full">
        Apply EQ
      </Button>
    </div>
  )
}
