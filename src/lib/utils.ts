import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function getOutputFilename(inputName: string, suffix: string, ext?: string): string {
  const base = inputName.replace(/\.[^/.]+$/, '')
  const extension = ext ?? inputName.split('.').pop() ?? 'mp3'
  return `${base}_${suffix}.${extension}`
}

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function chunksToSRT(chunks: Array<{ start: number; end: number; text: string }>): string {
  return chunks
    .map((chunk, i) => {
      const fmt = (s: number) => {
        const d = new Date(s * 1000)
        const hh = String(d.getUTCHours()).padStart(2, '0')
        const mm = String(d.getUTCMinutes()).padStart(2, '0')
        const ss = String(d.getUTCSeconds()).padStart(2, '0')
        const ms = String(d.getUTCMilliseconds()).padStart(3, '0')
        return `${hh}:${mm}:${ss},${ms}`
      }
      return `${i + 1}\n${fmt(chunk.start)} --> ${fmt(chunk.end)}\n${chunk.text.trim()}`
    })
    .join('\n\n')
}

export function chunksToVTT(chunks: Array<{ start: number; end: number; text: string }>): string {
  const lines = chunks.map((chunk) => {
    const fmt = (s: number) => {
      const d = new Date(s * 1000)
      const hh = String(d.getUTCHours()).padStart(2, '0')
      const mm = String(d.getUTCMinutes()).padStart(2, '0')
      const ss = String(d.getUTCSeconds()).padStart(2, '0')
      const ms = String(d.getUTCMilliseconds()).padStart(3, '0')
      return `${hh}:${mm}:${ss}.${ms}`
    }
    return `${fmt(chunk.start)} --> ${fmt(chunk.end)}\n${chunk.text.trim()}`
  })
  return `WEBVTT\n\n${lines.join('\n\n')}`
}
