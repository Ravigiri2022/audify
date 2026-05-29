'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AUDIO_FORMATS, type AudioFormat } from '@/lib/constants'

interface ConverterOptionsProps {
  onProcess: (format: AudioFormat, bitrate: number) => void
}

export default function ConverterOptions({ onProcess }: ConverterOptionsProps) {
  const [format, setFormat] = useState<AudioFormat>('mp3')
  const [bitrate, setBitrate] = useState(128)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Output Format</label>
        <div className="flex flex-wrap gap-2">
          {AUDIO_FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={[
                'rounded-lg border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors',
                format === f
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-brand/40 hover:text-text-primary',
              ].join(' ')}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Bitrate</label>
          <span className="text-sm tabular-nums text-brand">{bitrate} kbps</span>
        </div>
        <input
          type="range"
          min={32}
          max={320}
          step={32}
          value={bitrate}
          onChange={(e) => setBitrate(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>32 kbps</span>
          <span>320 kbps</span>
        </div>
      </div>

      <Button onClick={() => onProcess(format, bitrate)} className="w-full">
        Convert to {format.toUpperCase()}
      </Button>
    </div>
  )
}
