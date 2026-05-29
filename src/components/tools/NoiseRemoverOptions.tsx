'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NoiseRemoverOptionsProps {
  onProcess: (strength: 'low' | 'medium' | 'high') => void
}

const STRENGTHS = [
  {
    value: 'low' as const,
    label: 'Low',
    description: 'Subtle — gentle noise floor reduction',
  },
  {
    value: 'medium' as const,
    label: 'Medium',
    description: 'Balanced — removes most background noise',
  },
  {
    value: 'high' as const,
    label: 'High',
    description: 'Aggressive — maximum noise suppression',
  },
]

export default function NoiseRemoverOptions({ onProcess }: NoiseRemoverOptionsProps) {
  const [strength, setStrength] = useState<'low' | 'medium' | 'high'>('medium')

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary">Noise Reduction Strength</label>
        <div className="flex flex-col gap-2">
          {STRENGTHS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStrength(option.value)}
              className={cn(
                'flex items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
                strength === option.value
                  ? 'border-brand bg-brand/10'
                  : 'border-bg-border bg-bg-elevated hover:border-brand/40'
              )}
            >
              <div
                className={cn(
                  'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                  strength === option.value
                    ? 'border-brand bg-brand'
                    : 'border-bg-border bg-transparent'
                )}
              />
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    strength === option.value ? 'text-brand' : 'text-text-primary'
                  )}
                >
                  {option.label}
                </p>
                <p className="text-xs text-text-muted">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={() => onProcess(strength)} className="w-full">
        Remove Noise ({strength})
      </Button>
    </div>
  )
}
