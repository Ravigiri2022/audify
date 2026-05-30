'use client'

import * as React from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn, formatDuration } from '@/lib/utils'
import type { WaveformOverlayConfig } from '@/store/tool.store'

interface WaveformPlayerProps {
  blob: Blob | null
  label?: string
  className?: string
  height?: number
  overlay?: WaveformOverlayConfig | null
}

function SkeletonLoader({ height }: { height: number }) {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="rounded bg-bg-elevated" style={{ height }} />
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded bg-bg-elevated" />
        <div className="h-3 w-20 rounded bg-bg-elevated" />
        <div className="ml-auto h-3 w-16 rounded bg-bg-elevated" />
      </div>
    </div>
  )
}

// ── Overlay renderers ────────────────────────────────────────────────────────

function TrimOverlay({ start, end, dur }: { start: number; end: number; dur: number }) {
  const sp = (start / dur) * 100
  const ep = (end / dur) * 100
  return (
    <>
      {/* Dim before start */}
      {sp > 0 && (
        <div className="absolute inset-y-0 bg-black/50" style={{ left: 0, width: `${sp}%` }} />
      )}
      {/* Dim after end */}
      {ep < 100 && (
        <div className="absolute inset-y-0 bg-black/50" style={{ left: `${ep}%`, right: 0 }} />
      )}
      {/* Start line + label */}
      {sp > 0 && (
        <div className="absolute inset-y-0 w-[2px] bg-brand" style={{ left: `${sp}%` }}>
          <span className="absolute left-1 top-1.5 rounded bg-brand px-1 py-0.5 text-[9px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
            {formatDuration(start)}
          </span>
        </div>
      )}
      {/* End line + label */}
      {ep < 100 && (
        <div className="absolute inset-y-0 w-[2px] bg-brand" style={{ left: `${ep}%` }}>
          <span className="absolute right-1 top-1.5 rounded bg-brand px-1 py-0.5 text-[9px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
            {formatDuration(end)}
          </span>
        </div>
      )}
      {/* "Keep" badge in center of selection */}
      <div
        className="absolute top-1.5 flex -translate-x-1/2 items-center rounded bg-brand/20 px-1.5 py-0.5 text-[9px] font-semibold text-brand backdrop-blur-sm border border-brand/30"
        style={{ left: `${(sp + ep) / 2}%` }}
      >
        keep · {formatDuration(end - start)}
      </div>
    </>
  )
}

function FadeOverlay({ fadeIn, fadeOut, dur }: { fadeIn: number; fadeOut: number; dur: number }) {
  const fip = (fadeIn / dur) * 100
  const fop = ((dur - fadeOut) / dur) * 100
  return (
    <>
      {fadeIn > 0 && (
        <>
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{
              left: 0,
              width: `${fip}%`,
              background: 'linear-gradient(to right, rgba(124,58,237,0.55) 0%, transparent 100%)',
            }}
          />
          <div className="absolute inset-y-0 w-[2px] bg-brand/60" style={{ left: `${fip}%` }}>
            <span className="absolute left-1 top-1.5 rounded bg-brand px-1 py-0.5 text-[9px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
              ▶ in {fadeIn}s
            </span>
          </div>
        </>
      )}
      {fadeOut > 0 && (
        <>
          <div
            className="absolute inset-y-0 pointer-events-none"
            style={{
              left: `${fop}%`,
              right: 0,
              background: 'linear-gradient(to left, rgba(124,58,237,0.55) 0%, transparent 100%)',
            }}
          />
          <div className="absolute inset-y-0 w-[2px] bg-brand/60" style={{ left: `${fop}%` }}>
            <span className="absolute right-1 top-1.5 rounded bg-brand px-1 py-0.5 text-[9px] font-mono font-bold text-white shadow-lg whitespace-nowrap">
              ◀ out {fadeOut}s
            </span>
          </div>
        </>
      )}
    </>
  )
}

function SplitOverlay({ timestamps, dur }: { timestamps: number[]; dur: number }) {
  return (
    <>
      {timestamps.map((ts, i) => {
        const pct = (ts / dur) * 100
        return (
          <div key={i} className="absolute inset-y-0 w-[2px] bg-warning" style={{ left: `${pct}%` }}>
            <span className="absolute left-1 top-1.5 rounded bg-warning px-1 py-0.5 text-[9px] font-mono font-bold text-black shadow-lg whitespace-nowrap">
              ✂ {formatDuration(ts)}
            </span>
          </div>
        )
      })}
    </>
  )
}

function OverlayRenderer({ overlay, duration }: { overlay: WaveformOverlayConfig; duration: number }) {
  if (!duration) return null
  if (overlay.type === 'trim') return <TrimOverlay start={overlay.start} end={overlay.end} dur={duration} />
  if (overlay.type === 'fade') return <FadeOverlay fadeIn={overlay.fadeIn} fadeOut={overlay.fadeOut} dur={duration} />
  if (overlay.type === 'split') return <SplitOverlay timestamps={overlay.timestamps} dur={duration} />
  return null
}

// ── Main component ────────────────────────────────────────────────────────────

export function WaveformPlayer({ blob, label, className, height = 80, overlay }: WaveformPlayerProps) {
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
      ws.on('ready', () => { setDuration(ws!.getDuration()); setIsLoading(false); ws!.setVolume(volume / 100) })
      ws.on('audioprocess', () => setCurrentTime(ws!.getCurrentTime()))
      ws.on('seeking', () => setCurrentTime(ws!.getCurrentTime()))
      ws.on('play', () => setIsPlaying(true))
      ws.on('pause', () => setIsPlaying(false))
      ws.on('finish', () => setIsPlaying(false))
      ws.load(objectUrl)
    }).catch(() => setIsLoading(false))

    return () => { URL.revokeObjectURL(objectUrl); if (ws) { ws.destroy(); wsRef.current = null } }
  }, [blob]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => { if (wsRef.current) wsRef.current.setVolume(volume / 100) }, [volume])

  if (!blob) return null

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{label}</p>}

      {/* Waveform + overlay stack */}
      <div className="relative rounded-lg overflow-hidden bg-bg-elevated" style={{ minHeight: height }}>
        {/* WaveSurfer mounts here */}
        <div ref={containerRef} style={{ minHeight: height }} />

        {/* Overlay — rendered on top of waveform, pointer-events:none so seeking still works */}
        {overlay && !isLoading && duration > 0 && (
          <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
            <OverlayRenderer overlay={overlay} duration={duration} />
            {/* Remind user this is just a preview, not the processed result */}
            <span className="absolute bottom-1.5 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/70 backdrop-blur-sm">
              preview
            </span>
          </div>
        )}

        {/* Skeleton covers everything while loading */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-bg-elevated">
            <SkeletonLoader height={height} />
          </div>
        )}
      </div>

      {/* Transport bar */}
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

          <span className="text-xs tabular-nums font-mono text-text-muted shrink-0 w-10">
            {formatDuration(currentTime)}
          </span>

          {/* Click-to-seek bar */}
          <div
            className="flex-1 relative h-1 rounded-full bg-bg-border overflow-hidden cursor-pointer"
            onClick={(e) => {
              if (!wsRef.current || !duration) return
              const rect = e.currentTarget.getBoundingClientRect()
              wsRef.current.seekTo(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)))
            }}
          >
            <div
              className="h-full rounded-full bg-brand"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
          </div>

          <span className="text-xs tabular-nums font-mono text-text-muted shrink-0 w-10 text-right">
            {formatDuration(duration)}
          </span>

          <Volume2 size={12} className="text-text-muted shrink-0" />
          <div className="w-14 shrink-0">
            <Slider min={0} max={100} step={1} value={[volume]} onValueChange={([v]) => setVolume(v)} aria-label="Volume" />
          </div>
        </div>
      )}
    </div>
  )
}

export default WaveformPlayer
