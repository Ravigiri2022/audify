import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import { processWithFFmpeg } from '../_lib/process'

const DEFAULT_TARGET_LUFS = -14

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
  const targetLufsRaw = formData.get('target_lufs') as string | null

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  const targetLufs = targetLufsRaw !== null && targetLufsRaw !== ''
    ? Number(targetLufsRaw)
    : DEFAULT_TARGET_LUFS

  if (!Number.isFinite(targetLufs) || targetLufs > 0 || targetLufs < -70) {
    return Response.json(
      { error: 'Field "target_lufs" must be a number between -70 and 0 (e.g. -14)' },
      { status: 400 }
    )
  }

  const originalName = fileEntry.name || 'audio.bin'
  const inputExt = originalName.includes('.')
    ? originalName.split('.').pop()!.toLowerCase()
    : 'bin'

  // 3. Convert to Buffer
  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // 4. FFmpeg loudnorm filter args
  // loudnorm=I={target_lufs}:TP=-1.5:LRA=11
  const loudnormFilter = `loudnorm=I=${targetLufs}:TP=-1.5:LRA=11`
  const ffmpegArgs = ['-af', loudnormFilter]

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
      'Content-Disposition': `attachment; filename="normalized.${inputExt}"`,
      'Content-Length': String(outputBuffer.byteLength),
      'X-Target-LUFS': String(targetLufs),
    },
  })
}
