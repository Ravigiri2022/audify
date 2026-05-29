'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SilenceRemoverOptionsProps {
  onProcess: (thresholdDb: number, minDuration: number) => void
}

export default function SilenceRemoverOptions({ onProcess }: SilenceRemoverOptionsProps) {
  const [threshold, setThreshold] = useState(-40)
  const [minDuration, setMinDuration] = useState(0.5)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Silence Threshold</label>
          <span className="text-sm tabular-nums text-brand">{threshold} dB</span>
        </div>
        <input
          type="range"
          min={-60}
          max={-20}
          step={1}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>-60 dB (sensitive)</span>
          <span>-20 dB (aggressive)</span>
        </div>
        <p className="text-xs text-text-muted">
          Audio below this level is treated as silence.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Minimum Silence Duration</label>
          <span className="text-sm tabular-nums text-brand">{minDuration}s</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.1}
          value={minDuration}
          onChange={(e) => setMinDuration(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>0.1s</span>
          <span>3s</span>
        </div>
        <p className="text-xs text-text-muted">
          Only silences longer than this will be removed.
        </p>
      </div>

      <Button onClick={() => onProcess(threshold, minDuration)} className="w-full">
        Remove Silence
      </Button>
    </div>
  )
}
