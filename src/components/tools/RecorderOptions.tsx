'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Square, Pause, Play, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { recorderFacade } from '@/facades'

interface RecorderOptionsProps {
  onRecordingComplete: (blob: Blob) => void
}

type RecordState = 'idle' | 'recording' | 'paused' | 'error'

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const QUALITY_OPTIONS: { value: 'low' | 'medium' | 'high'; label: string; sub: string }[] = [
  { value: 'low', label: 'Low', sub: '64 kbps' },
  { value: 'medium', label: 'Medium', sub: '128 kbps' },
  { value: 'high', label: 'High', sub: '192 kbps' },
]

export default function RecorderOptions({ onRecordingComplete }: RecorderOptionsProps) {
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium')
  const [recordState, setRecordState] = useState<RecordState>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearTimer()
      // Stop any active recording on unmount
      if (recorderFacade.getState() !== 'inactive') {
        recorderFacade.stop().catch(() => {})
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setErrorMsg('')
      setElapsed(0)
      await recorderFacade.start(quality)
      setRecordState('recording')
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not start recording.')
      setRecordState('error')
    }
  }

  const pauseRecording = () => {
    recorderFacade.pause()
    setRecordState('paused')
    clearTimer()
  }

  const resumeRecording = () => {
    recorderFacade.resume()
    setRecordState('recording')
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }

  const stopRecording = async () => {
    clearTimer()
    try {
      const blob = await recorderFacade.stop()
      setRecordState('idle')
      setElapsed(0)
      onRecordingComplete(blob)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Recording stop failed.')
      setRecordState('error')
    }
  }

  const isIdle = recordState === 'idle' || recordState === 'error'
  const isRecording = recordState === 'recording'
  const isPaused = recordState === 'paused'
  const isActive = isRecording || isPaused

  return (
    <div className="flex flex-col gap-5">
      {/* Quality selector — only when idle */}
      {isIdle && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">Recording Quality</label>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuality(opt.value)}
                className={cn(
                  'flex flex-col items-center rounded-lg border px-2 py-2.5 transition-colors',
                  quality === opt.value
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-brand/40'
                )}
              >
                <span className="text-xs font-semibold">{opt.label}</span>
                <span className="text-xs">{opt.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timer display */}
      {isActive && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-bg-elevated py-6">
          <div className="flex items-center gap-2">
            {isRecording && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-error" />
              </span>
            )}
            {isPaused && <Pause className="h-3 w-3 text-warning" />}
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {isRecording ? 'Recording' : 'Paused'}
            </span>
          </div>
          <span className="text-4xl font-bold tabular-nums text-text-primary">
            {formatTimer(elapsed)}
          </span>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-2">
        {isIdle && (
          <Button onClick={startRecording} className="flex-1 gap-2">
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              variant="secondary"
              onClick={pauseRecording}
              className="flex-1 gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause
            </Button>
            <Button
              variant="destructive"
              onClick={stopRecording}
              className="flex-1 gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}

        {isPaused && (
          <>
            <Button
              variant="secondary"
              onClick={resumeRecording}
              className="flex-1 gap-2"
            >
              <Play className="h-4 w-4" />
              Resume
            </Button>
            <Button
              variant="destructive"
              onClick={stopRecording}
              className="flex-1 gap-2"
            >
              <Square className="h-4 w-4" />
              Stop &amp; Save
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
