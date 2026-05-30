'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToolStore } from '@/store/tool.store'
import { Music, ChevronUp, ChevronDown, X } from 'lucide-react'

interface MergerOptionsProps {
  onProcess: (crossfade: number) => void
}

export default function MergerOptions({ onProcess }: MergerOptionsProps) {
  const [crossfade, setCrossfade] = useState(0)
  const { inputFiles, setInputFiles } = useToolStore()

  const moveUp = (i: number) => {
    if (i === 0) return
    const files = [...inputFiles]
    ;[files[i - 1], files[i]] = [files[i], files[i - 1]]
    setInputFiles(files)
  }

  const moveDown = (i: number) => {
    if (i === inputFiles.length - 1) return
    const files = [...inputFiles]
    ;[files[i], files[i + 1]] = [files[i + 1], files[i]]
    setInputFiles(files)
  }

  const removeFile = (i: number) => {
    setInputFiles(inputFiles.filter((_, idx) => idx !== i))
  }

  const needsMore = inputFiles.length < 2
  const shortName = (name: string) => name.length > 28 ? name.slice(0, 25) + '…' : name

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg bg-bg-elevated/60 border border-bg-border px-3 py-2">
        <p className="text-xs font-semibold text-text-muted mb-1">How to use</p>
        <p className="text-xs text-text-secondary">
          Upload 2 or more files using the dropzone above. Drag the arrows to reorder tracks, then hit Merge.
        </p>
      </div>

      {inputFiles.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Track order · {inputFiles.length} file{inputFiles.length !== 1 ? 's' : ''}
          </p>
          <ul className="flex flex-col gap-1.5">
            {inputFiles.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand/10 text-[10px] font-bold text-brand">
                  {i + 1}
                </span>
                <Music className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                <span className="flex-1 text-sm text-text-primary font-mono text-xs">{shortName(file.name)}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="rounded p-1 text-text-muted hover:bg-bg-border hover:text-text-primary disabled:opacity-25 transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === inputFiles.length - 1}
                    className="rounded p-1 text-text-muted hover:bg-bg-border hover:text-text-primary disabled:opacity-25 transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="rounded p-1 text-text-muted hover:bg-bg-border hover:text-error transition-colors"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {needsMore && (
            <p className="text-xs text-text-muted">
              Add {2 - inputFiles.length} more file{2 - inputFiles.length !== 1 ? 's' : ''} using the dropzone above.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-text-muted">No files yet — use the dropzone above to add audio.</p>
      )}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-text-primary">Crossfade</label>
            <p className="text-xs text-text-muted">Smooth blend between consecutive tracks</p>
          </div>
          <span className="text-sm tabular-nums font-mono text-brand">
            {crossfade === 0 ? 'None' : `${crossfade}s`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={crossfade}
          onChange={(e) => setCrossfade(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-text-muted">
          <span>Hard cut</span>
          <span>5s blend</span>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-4 border-t border-bg-border/60 bg-bg-surface px-4 pb-4 pt-3">
        <Button onClick={() => onProcess(crossfade)} disabled={needsMore} className="w-full">
          {needsMore
            ? `Need ${2 - inputFiles.length} more file${2 - inputFiles.length !== 1 ? 's' : ''}`
            : `Merge ${inputFiles.length} tracks${crossfade > 0 ? ` · ${crossfade}s crossfade` : ''}`}
        </Button>
      </div>
    </div>
  )
}
