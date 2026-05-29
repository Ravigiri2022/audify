'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUPPORTED_AUDIO_FORMATS } from '@/lib/constants'

type DropzoneState = 'idle' | 'dragover' | 'error'

interface AudioDropzoneProps {
  onFiles: (files: File[]) => void
  multiple?: boolean
  accept?: string[]
  maxSizeMb?: number
  disabled?: boolean
  className?: string
}

export function AudioDropzone({
  onFiles,
  multiple = false,
  accept,
  maxSizeMb,
  disabled = false,
  className,
}: AudioDropzoneProps) {
  const [state, setState] = React.useState<DropzoneState>('idle')
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const zoneRef = React.useRef<HTMLDivElement>(null)

  const allowedTypes = accept ?? SUPPORTED_AUDIO_FORMATS
  const maxBytes = maxSizeMb != null ? maxSizeMb * 1024 * 1024 : null

  function validateAndEmit(rawFiles: FileList | File[]) {
    const arr = Array.from(rawFiles)
    const invalidType = arr.find(
      (f) =>
        !allowedTypes.includes(f.type) &&
        !/\.(mp3|wav|flac|ogg|m4a|aac|opus|webm|mp4|mkv)$/i.test(f.name)
    )
    if (invalidType) {
      setErrorMsg(`"${invalidType.name}" is not a supported audio format.`)
      setState('error')
      return
    }
    if (maxBytes != null) {
      const oversized = arr.find((f) => f.size > maxBytes)
      if (oversized) {
        setErrorMsg(`"${oversized.name}" exceeds the ${maxSizeMb} MB size limit.`)
        setState('error')
        return
      }
    }
    setErrorMsg(null)
    setState('idle')
    onFiles(multiple ? arr : [arr[0]])
  }

  React.useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    function onDragOver(e: DragEvent) {
      e.preventDefault()
      if (!disabled) setState('dragover')
    }
    function onDragLeave(e: DragEvent) {
      if (!zone!.contains(e.relatedTarget as Node)) setState('idle')
    }
    function onDrop(e: DragEvent) {
      e.preventDefault()
      if (disabled) return
      setState('idle')
      if (e.dataTransfer?.files) validateAndEmit(e.dataTransfer.files)
    }

    zone.addEventListener('dragover', onDragOver)
    zone.addEventListener('dragleave', onDragLeave)
    zone.addEventListener('drop', onDrop)
    return () => {
      zone.removeEventListener('dragover', onDragOver)
      zone.removeEventListener('dragleave', onDragLeave)
      zone.removeEventListener('drop', onDrop)
    }
  }, [disabled, allowedTypes, maxBytes, multiple])

  function handleClick() {
    if (!disabled) inputRef.current?.click()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      validateAndEmit(e.target.files)
      e.target.value = ''
    }
  }

  const isDragover = state === 'dragover'
  const isError = state === 'error'

  return (
    <div
      ref={zoneRef}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Audio file dropzone"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-200 cursor-pointer select-none',
        isDragover && 'border-brand-secondary bg-brand-secondary/5 scale-[1.01]',
        isError && 'border-error bg-error/5',
        !isDragover && !isError && 'border-bg-border bg-bg-surface hover:border-brand/50 hover:bg-bg-elevated',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept="audio/*,video/mp4,video/webm,video/mkv"
        multiple={multiple}
        onChange={handleInputChange}
        tabIndex={-1}
      />

      <motion.div
        animate={state === 'idle' ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={state === 'idle' ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200',
          isDragover ? 'bg-brand-secondary/20' : isError ? 'bg-error/15' : 'bg-bg-elevated'
        )}
      >
        <Upload
          size={20}
          className={cn(
            'transition-colors duration-200',
            isDragover ? 'text-brand-secondary' : isError ? 'text-error' : 'text-text-muted'
          )}
        />
      </motion.div>

      <div className="text-center">
        <p className="text-sm font-medium text-text-primary">
          {isDragover ? 'Drop your audio here' : 'Drag & drop audio files'}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {isError ? '' : 'or click to browse'}
        </p>
        {isError && errorMsg ? (
          <p className="mt-1 text-xs text-error font-medium">{errorMsg}</p>
        ) : (
          <p className="mt-2 text-xs text-text-muted">
            MP3, WAV, FLAC, OGG, M4A, AAC, OPUS
            {maxSizeMb != null && ` · max ${maxSizeMb} MB`}
          </p>
        )}
      </div>
    </div>
  )
}

export default AudioDropzone
