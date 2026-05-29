'use client'

import { Activity } from 'lucide-react'

interface BpmResultProps {
  bpm: number | null
  confidence: number | null
}

function tempoDescription(bpm: number): string {
  if (bpm < 60) return 'Larghissimo — very very slow'
  if (bpm < 66) return 'Largo — very slow, broad'
  if (bpm < 76) return 'Adagio — slowly'
  if (bpm < 108) return 'Andante — walking pace'
  if (bpm < 120) return 'Moderato — moderately'
  if (bpm < 156) return 'Allegro — fast and bright'
  if (bpm < 176) return 'Vivace — lively and fast'
  if (bpm < 200) return 'Presto — extremely fast'
  return 'Prestissimo — as fast as possible'
}

function confidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-success'
  if (confidence >= 0.5) return 'text-warning'
  return 'text-error'
}

export default function BpmResult({ bpm, confidence }: BpmResultProps) {
  if (bpm === null) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-bg-border bg-bg-surface px-6 py-10 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated">
          <Activity className="h-5 w-5 text-text-muted" />
        </div>
        <p className="text-sm text-text-muted">Run the BPM detector to see results here.</p>
      </div>
    )
  }

  if (bpm === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-bg-border bg-bg-surface px-6 py-8 text-center">
        <Activity className="h-6 w-6 text-text-muted" />
        <p className="text-sm text-text-muted">Could not detect a clear tempo in this file.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-brand/20 bg-bg-surface px-6 py-8 text-center">
      <div className="flex items-end gap-2">
        <span className="text-7xl font-extrabold tabular-nums leading-none text-brand">
          {bpm}
        </span>
        <span className="mb-2 text-lg font-semibold text-text-secondary">BPM</span>
      </div>

      <p className="text-sm text-text-secondary">{tempoDescription(bpm)}</p>

      {confidence !== null && (
        <div className="flex items-center gap-2 rounded-full border border-bg-border bg-bg-elevated px-4 py-1.5">
          <span className="text-xs text-text-muted">Confidence</span>
          <span className={`text-xs font-bold tabular-nums ${confidenceColor(confidence)}`}>
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  )
}
