'use client'
import { create } from 'zustand'
import type { ToolStatus } from '@/types/tool.types'

export type WaveformOverlayConfig =
  | { type: 'trim'; start: number; end: number; duration: number }
  | { type: 'fade'; fadeIn: number; fadeOut: number; duration: number }
  | { type: 'split'; timestamps: number[]; duration: number }

interface ToolStore {
  status: ToolStatus
  progress: number
  progressLabel: string
  inputFiles: File[]
  outputBlob: Blob | null
  outputFilename: string
  errorMessage: string | null
  processingStartTime: number | null
  inputOverlay: WaveformOverlayConfig | null
  setInputFiles: (files: File[]) => void
  setProgress: (p: number, label?: string) => void
  setResult: (blob: Blob, filename: string) => void
  setError: (msg: string) => void
  setStatus: (s: ToolStatus) => void
  setInputOverlay: (overlay: WaveformOverlayConfig | null) => void
  reset: () => void
}

const initialState = {
  status: 'idle' as ToolStatus,
  progress: 0,
  progressLabel: '',
  inputFiles: [] as File[],
  outputBlob: null,
  outputFilename: '',
  errorMessage: null,
  processingStartTime: null,
  inputOverlay: null,
}

export const useToolStore = create<ToolStore>((set) => ({
  ...initialState,

  setInputFiles: (files) => set({ inputFiles: files }),

  setProgress: (p, label) =>
    set((state) => ({
      progress: p,
      progressLabel: label !== undefined ? label : state.progressLabel,
    })),

  setResult: (blob, filename) =>
    set({ outputBlob: blob, outputFilename: filename, status: 'done', progress: 100 }),

  setError: (msg) => set({ errorMessage: msg, status: 'error' }),

  setStatus: (s) =>
    set((state) => ({
      status: s,
      processingStartTime:
        s === 'processing' && state.status !== 'processing'
          ? Date.now()
          : state.processingStartTime,
    })),

  setInputOverlay: (overlay) => set({ inputOverlay: overlay }),

  reset: () => set({ ...initialState }),
}))
