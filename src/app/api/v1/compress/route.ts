import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import { processWithFFmpeg } from '../_lib/process'

const DEFAULT_BITRATE = 128

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
  const bitrateRaw = formData.get('bitrate') as string | null

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  const bitrate = bitrateRaw !== null && bitrateRaw !== ''
    ? Number(bitrateRaw)
    : DEFAULT_BITRATE

  if (!Number.isFinite(bitrate) || bitrate <= 0) {
    return Response.json({ error: 'Field "bitrate" must be a positive number (kbps)' }, { status: 400 })
  }

  const originalName = fileEntry.name || 'audio.bin'
  const inputExt = originalName.includes('.')
    ? originalName.split('.').pop()!.toLowerCase()
    : 'bin'

  // 3. Convert to Buffer
  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // 4. FFmpeg args: re-encode to MP3 at the given bitrate
  const ffmpegArgs = ['-b:a', `${bitrate}k`]

  // 5. Process — output is always MP3
  let outputBuffer: Buffer
  try {
    outputBuffer = await processWithFFmpeg(inputBuffer, inputExt, ffmpegArgs, 'mp3')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FFmpeg processing failed'
    return Response.json({ error: message }, { status: 422 })
  }

  // 6. Return binary response
  return new Response(new Uint8Array(outputBuffer), {
    headers: {
      'Content-Type': 'audio/mp3',
      'Content-Disposition': 'attachment; filename="compressed.mp3"',
      'Content-Length': String(outputBuffer.byteLength),
    },
  })
}
