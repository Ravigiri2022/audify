'use client'

import * as React from 'react'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn, formatDuration } from '@/lib/utils'

interface WaveformPlayerProps {
  blob: Blob | null
  label?: string
  className?: string
}

function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="h-24 rounded-lg bg-bg-elevated" />
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded bg-bg-elevated" />
        <div className="h-4 w-24 rounded bg-bg-elevated" />
        <div className="ml-auto h-4 w-20 rounded bg-bg-elevated" />
      </div>
    </div>
  )
}

export function WaveformPlayer({ blob, label, className }: WaveformPlayerProps) {
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
        height: 80,
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

      ws.on('audioprocess', () => {
        setCurrentTime(ws!.getCurrentTime())
      })

      ws.on('seeking', () => {
        setCurrentTime(ws!.getCurrentTime())
      })

      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => setIsPlaying(false))

      ws.load(objectUrl)
    }).catch(() => {
      setIsLoading(false)
    })

    return () => {
      URL.revokeObjectURL(objectUrl)
      if (ws) {
        ws.destroy()
        wsRef.current = null
      }
    }
  }, [blob])

  React.useEffect(() => {
    if (wsRef.current) {
      wsRef.current.setVolume(volume / 100)
    }
  }, [volume])

  function togglePlay() {
    wsRef.current?.playPause()
  }

  if (!blob) return null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label && (
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
      )}

      {isLoading ? (
        <SkeletonLoader />
      ) : (
        <>
          <div
            ref={containerRef}
            className="rounded-lg overflow-hidden bg-bg-elevated px-2 py-2"
          />

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>

            <span className="text-xs tabular-nums text-text-muted shrink-0">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>

            <div className="ml-auto flex items-center gap-2 w-24">
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
        </>
      )}
    </div>
  )
}

export default WaveformPlayer
