'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NormalizerOptionsProps {
  onProcess: (targetLufs: number) => void
}

const PRESETS = [
  { label: '-14 LUFS', description: 'Streaming', value: -14 },
  { label: '-16 LUFS', description: 'Podcast', value: -16 },
  { label: '-23 LUFS', description: 'Broadcast', value: -23 },
]

export default function NormalizerOptions({ onProcess }: NormalizerOptionsProps) {
  const [targetLufs, setTargetLufs] = useState(-14)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(-14)

  const handlePreset = (value: number) => {
    setTargetLufs(value)
    setSelectedPreset(value)
  }

  const handleSlider = (value: number) => {
    setTargetLufs(value)
    setSelectedPreset(null)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Target Level</label>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePreset(preset.value)}
              className={cn(
                'flex flex-col items-center rounded-lg border px-2 py-2.5 transition-colors',
                selectedPreset === preset.value
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-brand/40'
              )}
            >
              <span className="text-xs font-bold">{preset.label}</span>
              <span className="text-xs">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Custom Target</label>
          <span className="text-sm tabular-nums text-brand">{targetLufs} LUFS</span>
        </div>
        <input
          type="range"
          min={-30}
          max={-6}
          step={1}
          value={targetLufs}
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>-30 LUFS (quiet)</span>
          <span>-6 LUFS (loud)</span>
        </div>
      </div>

      <Button onClick={() => onProcess(targetLufs)} className="w-full">
        Normalize to {targetLufs} LUFS
      </Button>
    </div>
  )
}
