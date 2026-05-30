'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface SilenceRemoverOptionsProps {
  onProcess: (thresholdDb: number, minDuration: number) => void
}

function DbMeter({ value, min, max }: { value: number; min: number; max: number }) {
  const pct = ((value - min) / (max - min)) * 100
  // green (gentle) → yellow → red (aggressive)
  const hue = Math.round(120 - (pct / 100) * 110)
  return (
    <div className="relative h-2.5 rounded-full bg-bg-border overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-150"
        style={{ width: `${pct}%`, backgroundColor: `hsl(${hue} 75% 48%)` }}
      />
    </div>
  )
}

export default function SilenceRemoverOptions({ onProcess }: SilenceRemoverOptionsProps) {
  const [threshold, setThreshold] = useState(-40)
  const [minDuration, setMinDuration] = useState(0.5)

  const label =
    threshold >= -25 ? 'Aggressive' : threshold >= -35 ? 'Moderate' : 'Gentle'
  const labelColor =
    threshold >= -25 ? 'text-error' : threshold >= -35 ? 'text-warning' : 'text-success'

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg bg-bg-elevated/60 border border-bg-border px-3 py-2">
        <p className="text-xs font-semibold text-text-muted mb-1">How to use</p>
        <p className="text-xs text-text-secondary">
          Raises the threshold to catch louder silences (more aggressive), or lowers it to only cut very quiet gaps (gentle).
          Increase min duration to ignore brief pauses.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-text-primary">Silence Threshold</label>
            <p className="text-xs text-text-muted">Audio quieter than this is treated as silence</p>
          </div>
          <div className="text-right">
            <span className="block text-sm tabular-nums font-mono text-brand">{threshold} dB</span>
            <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
          </div>
        </div>
        <DbMeter value={threshold} min={-60} max={-20} />
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
          <span>-60 dB · gentle</span>
          <span>-20 dB · aggressive</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-text-primary">Min Silence Duration</label>
            <p className="text-xs text-text-muted">Only silences longer than this are removed</p>
          </div>
          <span className="text-sm tabular-nums font-mono text-brand">{minDuration}s</span>
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
          <span>0.1s · brief pauses</span>
          <span>3s · long gaps only</span>
        </div>
      </div>

      <div className="rounded-lg bg-bg-elevated border border-bg-border px-3 py-2 text-xs text-text-secondary">
        Removing silences{' '}
        <span className="font-medium text-text-primary">quieter than {threshold} dB</span>
        {' '}and{' '}
        <span className="font-medium text-text-primary">longer than {minDuration}s</span>.
      </div>

      <Button onClick={() => onProcess(threshold, minDuration)} className="w-full">
        Remove Silence
      </Button>
    </div>
  )
}
