'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FadeOptionsProps {
  onProcess: (fadeIn: number, fadeOut: number) => void
}

export default function FadeOptions({ onProcess }: FadeOptionsProps) {
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(0)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Fade In</label>
          <span className="text-sm tabular-nums text-brand">
            {fadeIn === 0 ? 'None' : `${fadeIn}s`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={fadeIn}
          onChange={(e) => setFadeIn(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>No fade in</span>
          <span>10 seconds</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Fade Out</label>
          <span className="text-sm tabular-nums text-brand">
            {fadeOut === 0 ? 'None' : `${fadeOut}s`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={fadeOut}
          onChange={(e) => setFadeOut(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>No fade out</span>
          <span>10 seconds</span>
        </div>
      </div>

      {fadeIn === 0 && fadeOut === 0 && (
        <p className="text-xs text-text-muted">
          Set at least one fade to apply an effect.
        </p>
      )}

      <Button
        onClick={() => onProcess(fadeIn, fadeOut)}
        disabled={fadeIn === 0 && fadeOut === 0}
        className="w-full"
      >
        Apply Fade
        {fadeIn > 0 && fadeOut > 0
          ? ` In ${fadeIn}s + Out ${fadeOut}s`
          : fadeIn > 0
          ? ` In ${fadeIn}s`
          : fadeOut > 0
          ? ` Out ${fadeOut}s`
          : ''}
      </Button>
    </div>
  )
}
