'use client'

import { Columns } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StereoMonoOptionsProps {
  onProcess: () => void
}

export default function StereoMonoOptions({ onProcess }: StereoMonoOptionsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg bg-bg-elevated px-4 py-3">
        <Columns className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
        <div className="text-sm text-text-secondary">
          <p>
            Converts a stereo (2-channel) audio file into a single mono channel by mixing
            the left and right channels together.
          </p>
          <p className="mt-1">
            Mono files are smaller and compatible with more playback systems.
          </p>
        </div>
      </div>

      <Button onClick={onProcess} className="w-full">
        Convert to Mono
      </Button>
    </div>
  )
}
