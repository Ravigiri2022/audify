'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SpeedChangerOptionsProps {
  onProcess: (multiplier: number) => void
}

function speedDescription(multiplier: number): string {
  if (multiplier < 0.75) return 'Very slow'
  if (multiplier < 0.95) return 'Slowed down'
  if (multiplier >= 0.95 && multiplier <= 1.05) return 'Normal speed'
  if (multiplier <= 1.5) return 'Slightly faster'
  if (multiplier <= 2.0) return 'Fast'
  if (multiplier <= 3.0) return 'Very fast'
  return 'Ultra fast'
}

export default function SpeedChangerOptions({ onProcess }: SpeedChangerOptionsProps) {
  const [multiplier, setMultiplier] = useState(1.0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Playback Speed</label>
          <span className="text-sm tabular-nums text-brand">{multiplier.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={4.0}
          step={0.1}
          value={multiplier}
          onChange={(e) => setMultiplier(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>0.5x (slowest)</span>
          <span>4.0x (fastest)</span>
        </div>
      </div>

      <div className="rounded-lg bg-bg-elevated px-4 py-3 text-center">
        <p className="text-lg font-bold text-brand">{multiplier.toFixed(1)}x</p>
        <p className="text-xs text-text-muted">{speedDescription(multiplier)}</p>
      </div>

      <Button onClick={() => onProcess(multiplier)} className="w-full">
        Change Speed to {multiplier.toFixed(1)}x
      </Button>
    </div>
  )
}
