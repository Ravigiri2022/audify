'use client'

import { AudioLines, ImageDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

// This tool has no process button — the waveform is shown automatically
// from the input file via the ToolPageLayout's WaveformPlayer.
export default function WaveformOptions() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg bg-bg-elevated px-4 py-3">
        <AudioLines className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <p className="text-sm text-text-secondary">
          Your waveform is shown above. Use the player to navigate and play back your audio.
        </p>
      </div>

      <div className="relative">
        <Button
          disabled
          variant="secondary"
          className="w-full gap-2 opacity-50"
          title="Coming soon"
        >
          <ImageDown className="h-4 w-4" />
          Export as PNG
          <span className="ml-auto rounded-full bg-bg-border px-2 py-0.5 text-xs text-text-muted">
            Coming soon
          </span>
        </Button>
      </div>
    </div>
  )
}
