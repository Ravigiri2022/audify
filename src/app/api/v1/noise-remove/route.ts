import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import { processWithFFmpeg } from '../_lib/process'

type NoiseStrength = 'low' | 'medium' | 'high'

// afftdn (Adaptive Fast Fourier Transform Denoiser) sigma values per strength level.
// Higher sigma = more aggressive noise reduction.
const NOISE_SIGMA: Record<NoiseStrength, number> = {
  low: 5,
  medium: 12,
  high: 25,
}

const DEFAULT_STRENGTH: NoiseStrength = 'medium'

export async function POST(request: NextRequest) {
  // 1. Validate API key
  const ctx = await validateApiKey(request)
  if (isErrorResponse(ctx)) return ctx

  // 2. Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Failed to parse multipart form data' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  const strengthRaw = (formData.get('strength') as string | null)?.toLowerCase().trim()

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  const strength: NoiseStrength = (strengthRaw as NoiseStrength) || DEFAULT_STRENGTH

  if (!Object.keys(NOISE_SIGMA).includes(strength)) {
    return Response.json(
      { error: 'Field "strength" must be one of: low, medium, high' },
      { status: 400 }
    )
  }

  const sigma = NOISE_SIGMA[strength]

  const originalName = fileEntry.name || 'audio.bin'
  const inputExt = originalName.includes('.')
    ? originalName.split('.').pop()!.toLowerCase()
    : 'bin'

  // 3. Convert to Buffer
  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // 4. FFmpeg afftdn filter args
  // afftdn=nr={sigma}:nf=-25 — nr is the noise reduction factor (0-97), nf is noise floor
  const afftdnFilter = `afftdn=nr=${sigma}:nf=-25`
  const ffmpegArgs = ['-af', afftdnFilter]

  // 5. Process — preserve original format
  let outputBuffer: Buffer
  try {
    outputBuffer = await processWithFFmpeg(inputBuffer, inputExt, ffmpegArgs, inputExt)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FFmpeg processing failed'
    return Response.json({ error: message }, { status: 422 })
  }

  // 6. Return binary response
  return new Response(new Uint8Array(outputBuffer), {
    headers: {
      'Content-Type': `audio/${inputExt}`,
      'Content-Disposition': `attachment; filename="denoised.${inputExt}"`,
      'Content-Length': String(outputBuffer.byteLength),
      'X-Noise-Strength': strength,
    },
  })
}
