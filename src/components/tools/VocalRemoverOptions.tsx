'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VocalRemoverOptionsProps {
  onProcess: () => void
}

export default function VocalRemoverOptions({ onProcess }: VocalRemoverOptionsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div className="text-sm text-text-secondary">
          <p className="font-medium text-text-primary">Best results on stereo tracks</p>
          <p className="mt-1">
            Works best on stereo tracks with center-panned vocals. Uses phase cancellation
            to subtract common content between left and right channels.
          </p>
          <p className="mt-1">
            Some instruments panned to center (bass, kick) may also be reduced.
          </p>
        </div>
      </div>

      <Button onClick={onProcess} className="w-full">
        Remove Vocals
      </Button>
    </div>
  )
}
