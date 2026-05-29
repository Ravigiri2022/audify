'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface MergerOptionsProps {
  onProcess: (crossfade: number) => void
}

export default function MergerOptions({ onProcess }: MergerOptionsProps) {
  const [crossfade, setCrossfade] = useState(0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Crossfade Duration</label>
          <span className="text-sm tabular-nums text-brand">
            {crossfade === 0 ? 'None' : `${crossfade}s`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={crossfade}
          onChange={(e) => setCrossfade(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>No crossfade</span>
          <span>5 second blend</span>
        </div>
      </div>

      {crossfade > 0 && (
        <p className="text-xs text-text-muted">
          A {crossfade}s fade will smooth the join between consecutive tracks.
        </p>
      )}

      <Button onClick={() => onProcess(crossfade)} className="w-full">
        Merge Files
      </Button>
    </div>
  )
}
