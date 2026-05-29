'use client'

import { Download, FileText, Captions } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadBlob } from '@/lib/utils'
import type { TranscriptionResult as TResult } from '@/types/tool.types'

interface TranscriptionResultProps {
  result: TResult | null
}

export default function TranscriptionResult({ result }: TranscriptionResultProps) {
  if (!result) return null

  const downloadTxt = () => {
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, 'transcription.txt')
  }

  const downloadSrt = () => {
    const blob = new Blob([result.srt], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, 'transcription.srt')
  }

  const downloadVtt = () => {
    const blob = new Blob([result.vtt], { type: 'text/plain;charset=utf-8' })
    downloadBlob(blob, 'transcription.vtt')
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-bg-border bg-bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">Transcription</h3>
        <span className="text-xs text-text-muted">
          {result.chunks.length} segment{result.chunks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg bg-bg-elevated p-3">
        {result.text ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
            {result.text}
          </p>
        ) : (
          <p className="text-sm text-text-muted italic">No speech detected.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={downloadTxt}
          className="gap-1.5"
        >
          <FileText className="h-3.5 w-3.5" />
          TXT
          <Download className="h-3 w-3 opacity-60" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={downloadSrt}
          className="gap-1.5"
        >
          <Captions className="h-3.5 w-3.5" />
          SRT
          <Download className="h-3 w-3 opacity-60" />
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={downloadVtt}
          className="gap-1.5"
        >
          <Captions className="h-3.5 w-3.5" />
          VTT
          <Download className="h-3 w-3 opacity-60" />
        </Button>
      </div>
    </div>
  )
}
