'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useWhisper } from '@/hooks/useWhisper'

interface TranscriptionOptionsProps {
  onProcess: (modelSize: 'tiny' | 'base', language: string) => void
}

const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ar', label: 'Arabic' },
]

const MODEL_OPTIONS = [
  { value: 'tiny' as const, label: 'Tiny', sub: 'Fast · ~75 MB' },
  { value: 'base' as const, label: 'Base', sub: 'Accurate · ~145 MB' },
]

export default function TranscriptionOptions({ onProcess }: TranscriptionOptionsProps) {
  const [modelSize, setModelSize] = useState<'tiny' | 'base'>('tiny')
  const [language, setLanguage] = useState('auto')
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const { isLoaded, downloadProgress, loadError, load } = useWhisper()

  const handleTranscribe = async () => {
    if (!isLoaded) {
      setIsLoadingModel(true)
      await load(modelSize)
      setIsLoadingModel(false)
    }
    onProcess(modelSize, language === 'auto' ? '' : language)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Model Size</label>
        <div className="grid grid-cols-2 gap-2">
          {MODEL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setModelSize(opt.value)}
              className={cn(
                'flex flex-col rounded-lg border px-3 py-2.5 text-left transition-colors',
                modelSize === opt.value
                  ? 'border-brand bg-brand/10'
                  : 'border-bg-border bg-bg-elevated hover:border-brand/40'
              )}
            >
              <span
                className={cn(
                  'text-sm font-semibold',
                  modelSize === opt.value ? 'text-brand' : 'text-text-primary'
                )}
              >
                {opt.label}
              </span>
              <span className="text-xs text-text-muted">{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="transcription-language" className="text-sm font-medium text-text-primary">
          Language
        </label>
        <select
          id="transcription-language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full rounded-lg border border-bg-border bg-bg-elevated px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {(isLoadingModel || (downloadProgress > 0 && downloadProgress < 100)) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
            <span className="text-xs text-text-secondary">
              Downloading {modelSize} model…
            </span>
            <span className="ml-auto text-xs tabular-nums text-brand">
              {Math.round(downloadProgress)}%
            </span>
          </div>
          <Progress value={downloadProgress} />
          <p className="text-xs text-text-muted">
            The model runs entirely in your browser. No audio is sent to any server.
          </p>
        </div>
      )}

      {loadError && (
        <p className="text-xs text-error">{loadError}</p>
      )}

      {isLoaded && (
        <div className="rounded-lg bg-brand/5 px-3 py-2 text-xs text-brand">
          {modelSize.charAt(0).toUpperCase() + modelSize.slice(1)} model ready.
        </div>
      )}

      <Button
        onClick={handleTranscribe}
        disabled={isLoadingModel}
        className="w-full"
      >
        {isLoadingModel ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading model…
          </>
        ) : isLoaded ? (
          'Transcribe'
        ) : (
          'Download Model & Transcribe'
        )}
      </Button>
    </div>
  )
}
