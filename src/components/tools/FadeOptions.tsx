'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToolStore } from '@/store/tool.store'

interface FadeOptionsProps {
  onProcess: (fadeIn: number, fadeOut: number) => void
  duration?: number
}

function FadeBar({ value, max, type }: { value: number; max: number; type: 'in' | 'out' }) {
  const pct = (value / max) * 100
  return (
    <div className="relative h-5 rounded bg-bg-border overflow-hidden">
      <div
        className="absolute inset-y-0 transition-all duration-150"
        style={
          type === 'in'
            ? { left: 0, width: `${pct}%`, background: 'linear-gradient(to right, hsl(258 90% 62% / 0.4), transparent)' }
            : { right: 0, width: `${pct}%`, background: 'linear-gradient(to left, hsl(258 90% 62% / 0.4), transparent)' }
        }
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[10px] text-text-muted font-mono">
          {type === 'in' ? '▶' : '◀'} {value > 0 ? `${value}s` : 'off'}
        </span>
      </div>
    </div>
  )
}

export default function FadeOptions({ onProcess, duration = 0 }: FadeOptionsProps) {
  const [fadeIn, setFadeIn] = useState(0)
  const [fadeOut, setFadeOut] = useState(0)
  const { setInputOverlay } = useToolStore()

  function updateOverlay(fi: number, fo: number) {
    if (duration > 0 && (fi > 0 || fo > 0)) {
      setInputOverlay({ type: 'fade', fadeIn: fi, fadeOut: fo, duration })
    } else {
      setInputOverlay(null)
    }
  }

  function handleFadeIn(v: number) { setFadeIn(v); updateOverlay(v, fadeOut) }
  function handleFadeOut(v: number) { setFadeOut(v); updateOverlay(fadeIn, v) }

  // Update overlay if duration arrives after sliders are already set
  useEffect(() => {
    if (duration > 0 && (fadeIn > 0 || fadeOut > 0)) {
      setInputOverlay({ type: 'fade', fadeIn, fadeOut, duration })
    }
  }, [duration]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => setInputOverlay(null), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg bg-bg-elevated/60 border border-bg-border px-3 py-2">
        <p className="text-xs font-semibold text-text-muted mb-1">How to use</p>
        <p className="text-xs text-text-secondary">
          <span className="text-text-primary font-medium">Fade In</span> — volume rises from silence at the start.{' '}
          <span className="text-text-primary font-medium">Fade Out</span> — fades to silence at the end.
          The gradient overlay on the waveform shows exactly where each fade applies.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Fade In</label>
          <span className="text-sm tabular-nums font-mono text-brand">{fadeIn === 0 ? 'Off' : `${fadeIn}s`}</span>
        </div>
        <FadeBar value={fadeIn} max={10} type="in" />
        <input type="range" min={0} max={10} step={0.5} value={fadeIn}
          onChange={(e) => handleFadeIn(Number(e.target.value))}
          className="w-full accent-brand" />
        <div className="flex justify-between text-xs text-text-muted">
          <span>Off</span><span>10 seconds</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Fade Out</label>
          <span className="text-sm tabular-nums font-mono text-brand">{fadeOut === 0 ? 'Off' : `${fadeOut}s`}</span>
        </div>
        <FadeBar value={fadeOut} max={10} type="out" />
        <input type="range" min={0} max={10} step={0.5} value={fadeOut}
          onChange={(e) => handleFadeOut(Number(e.target.value))}
          className="w-full accent-brand" />
        <div className="flex justify-between text-xs text-text-muted">
          <span>Off</span><span>10 seconds</span>
        </div>
      </div>

      {fadeIn === 0 && fadeOut === 0 && (
        <p className="text-xs text-text-muted">Set at least one fade to enable processing.</p>
      )}

      <Button onClick={() => onProcess(fadeIn, fadeOut)} disabled={fadeIn === 0 && fadeOut === 0} className="w-full">
        Apply{fadeIn > 0 && fadeOut > 0 ? ` · In ${fadeIn}s + Out ${fadeOut}s`
          : fadeIn > 0 ? ` · Fade In ${fadeIn}s`
          : fadeOut > 0 ? ` · Fade Out ${fadeOut}s` : ''}
      </Button>
    </div>
  )
}
