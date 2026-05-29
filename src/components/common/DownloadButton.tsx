'use client'

import * as React from 'react'
import { Download, BookmarkPlus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { downloadBlob } from '@/lib/utils'

interface DownloadButtonProps {
  blob: Blob | null
  filename: string
  onSaveToLibrary?: () => void
  isSaving?: boolean
}

export function DownloadButton({ blob, filename, onSaveToLibrary, isSaving = false }: DownloadButtonProps) {
  const [saved, setSaved] = React.useState(false)

  function handleDownload() {
    if (!blob) return
    downloadBlob(blob, filename)
  }

  async function handleSave() {
    if (!onSaveToLibrary) return
    onSaveToLibrary()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="default"
        onClick={handleDownload}
        disabled={!blob}
        className="gap-2"
      >
        <Download size={15} />
        Download
      </Button>

      {onSaveToLibrary && (
        <Button
          variant="secondary"
          size="default"
          onClick={handleSave}
          disabled={!blob || isSaving}
          className="gap-2"
        >
          {saved ? (
            <>
              <Check size={15} className="text-success" />
              Saved
            </>
          ) : (
            <>
              <BookmarkPlus size={15} />
              {isSaving ? 'Saving…' : 'Save to Library'}
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default DownloadButton
