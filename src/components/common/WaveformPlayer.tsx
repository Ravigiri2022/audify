'use client'

import * as React from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn, formatDuration } from '@/lib/utils'

interface WaveformPlayerProps {
  blob: Blob | null
  label?: string
  className?: string
  height?: number
}

function SkeletonLoader({ height }: { height: number }) {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="rounded-lg bg-bg-elevated" style={{ height }} />
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-bg-elevated" />
        <div className="h-3 w-20 rounded bg-bg-elevated" />
        <div className="ml-auto h-3 w-16 rounded bg-bg-elevated" />
      </div>
    </div>
  )
}

export function WaveformPlayer({ blob, label, className, height = 80 }: WaveformPlayerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const wsRef = React.useRef<import('wavesurfer.js').default | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [volume, setVolume] = React.useState(80)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (!blob || !containerRef.current) return

    let ws: import('wavesurfer.js').default | null = null
    setIsLoading(true)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    const objectUrl = URL.createObjectURL(blob)

    import('wavesurfer.js').then(({ default: WaveSurfer }) => {
      if (!containerRef.current) return

      ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#7c3aed',
        progressColor: '#4f46e5',
        height,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        cursorWidth: 1,
        cursorColor: '#a78bfa',
        normalize: true,
        interact: true,
      })

      wsRef.current = ws

      ws.on('ready', () => {
        setDuration(ws!.getDuration())
        setIsLoading(false)
        ws!.setVolume(volume / 100)
      })

      ws.on('audioprocess', () => setCurrentTime(ws!.getCurrentTime()))
      ws.on('seeking', () => setCurrentTime(ws!.getCurrentTime()))
      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => setIsPlaying(false))

      ws.load(objectUrl)
    }).catch(() => setIsLoading(false))

    return () => {
      URL.revokeObjectURL(objectUrl)
      if (ws) { ws.destroy(); wsRef.current = null }
    }
  }, [blob]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (wsRef.current) wsRef.current.setVolume(volume / 100)
  }, [volume])

  if (!blob) return null

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</p>
      )}

      {/* Container always in DOM — skeleton overlays it while loading */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10">
            <SkeletonLoader height={height} />
          </div>
        )}
        <div
          ref={containerRef}
          className="rounded-lg overflow-hidden bg-bg-elevated px-2 py-1"
          style={{ minHeight: height + 8 }}
        />
      </div>

      {!isLoading && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => wsRef.current?.playPause()}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </Button>

          <span className="text-xs tabular-nums font-mono text-text-muted shrink-0">
            {formatDuration(currentTime)}
          </span>

          {/* Click-to-seek progress bar */}
          <div className="flex-1 relative h-1 rounded-full bg-bg-border overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (!wsRef.current || !duration) return
              const rect = e.currentTarget.getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              wsRef.current.seekTo(Math.max(0, Math.min(1, pct)))
            }}
          >
            <div
              className="h-full rounded-full bg-brand transition-none"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>

          <span className="text-xs tabular-nums font-mono text-text-muted shrink-0">
            {formatDuration(duration)}
          </span>

          <Volume2 size={12} className="text-text-muted shrink-0" />
          <div className="w-16">
            <Slider
              min={0}
              max={100}
              step={1}
              value={[volume]}
              onValueChange={([v]) => setVolume(v)}
              aria-label="Volume"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default WaveformPlayer
