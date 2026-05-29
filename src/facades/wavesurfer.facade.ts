import WaveSurfer from 'wavesurfer.js'

interface WaveSurferOptions {
  waveColor: string
  progressColor: string
  height: number
}

const DEFAULTS: WaveSurferOptions = {
  waveColor: '#7c3aed',
  progressColor: '#4f46e5',
  height: 80,
}

class WaveSurferFacade {
  create(
    container: HTMLElement,
    options?: Partial<WaveSurferOptions>
  ): WaveSurfer {
    return WaveSurfer.create({
      ...DEFAULTS,
      ...options,
      container,
      normalize: true,
      interact: true,
    })
  }

  destroy(ws: WaveSurfer): void {
    ws.destroy()
  }
}

export const wavesurferFacade = new WaveSurferFacade()
