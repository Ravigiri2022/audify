'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeIn } from '@/lib/motion'
import type { ToolStatus } from '@/types/tool.types'

interface ProcessingOverlayProps {
  status: ToolStatus
  progress: number
  label: string
  onCancel?: () => void
}

export function ProcessingOverlay({ status, progress, label, onCancel }: ProcessingOverlayProps) {
  const visible = status === 'loading_wasm' || status === 'processing'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="processing-overlay"
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2 }}
          className="w-full rounded-xl border border-brand/20 bg-bg-surface px-6 py-8 flex flex-col items-center gap-4"
        >
          {status === 'loading_wasm' && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand" />
              </span>
              <p className="text-xs text-text-secondary">Loading audio engine…</p>
            </div>
          )}

          <div className="w-full max-w-sm flex flex-col gap-2">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-bg-elevated">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-brand to-brand-secondary"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-text-secondary">{label}</p>
              <span className="text-xs tabular-nums text-text-muted">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-text-muted hover:text-error gap-1"
            >
              <X size={14} />
              Cancel
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProcessingOverlay
