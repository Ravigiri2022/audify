'use client'

import { useState, useEffect } from 'react'

export function useAudioDuration(file: File | null): number {
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (!file) { setDuration(0); return }
    const url = URL.createObjectURL(file)
    const audio = new Audio(url)
    const onMeta = () => { setDuration(audio.duration); URL.revokeObjectURL(url) }
    audio.addEventListener('loadedmetadata', onMeta)
    return () => { audio.removeEventListener('loadedmetadata', onMeta); URL.revokeObjectURL(url) }
  }, [file])

  return duration
}
