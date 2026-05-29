'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToolStore } from '@/store/tool.store'

interface CompressorOptionsProps {
  onProcess: (bitrate: number) => void
}

// Rough MP3 size estimate: (bitrate kbps * duration_s) / 8 bytes
function estimateOutputSize(inputBytes: number, bitrate: number): string {
  // Assume ~128 kbps average for input estimation
  const estimatedDurationS = (inputBytes * 8) / (128 * 1000)
  const outputBytes = (bitrate * 1000 * estimatedDurationS) / 8
  const mb = outputBytes / (1024 * 1024)
  if (mb < 1) return `~${(outputBytes / 1024).toFixed(0)} KB`
  return `~${mb.toFixed(1)} MB`
}

export default function CompressorOptions({ onProcess }: CompressorOptionsProps) {
  const [bitrate, setBitrate] = useState(96)
  const { inputFiles } = useToolStore()
  const inputSize = inputFiles[0]?.size ?? 0

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-primary">Output Bitrate</label>
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
          <span>32 kbps (smallest)</span>
          <span>320 kbps (best quality)</span>
        </div>
      </div>

      {inputSize > 0 && (
        <div className="rounded-lg bg-bg-elevated px-4 py-3 text-sm">
          <div className="flex justify-between text-text-secondary">
            <span>Input size</span>
            <span className="font-medium text-text-primary">
              {(inputSize / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>
          <div className="mt-1 flex justify-between text-text-secondary">
            <span>Estimated output</span>
            <span className="font-medium text-brand">{estimateOutputSize(inputSize, bitrate)}</span>
          </div>
        </div>
      )}

      <Button onClick={() => onProcess(bitrate)} className="w-full">
        Compress to {bitrate} kbps
      </Button>
    </div>
  )
}
