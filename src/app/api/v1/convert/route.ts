import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import { processWithFFmpeg } from '../_lib/process'

const SUPPORTED_FORMATS = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'webm']

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
  const format = (formData.get('format') as string | null)?.toLowerCase().trim()
  const bitrate = (formData.get('bitrate') as string | null)?.trim()

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  if (!format) {
    return Response.json({ error: 'Missing required field: format' }, { status: 400 })
  }

  if (!SUPPORTED_FORMATS.includes(format)) {
    return Response.json(
      { error: `Unsupported format "${format}". Supported: ${SUPPORTED_FORMATS.join(', ')}` },
      { status: 400 }
    )
  }

  // Derive input extension from the uploaded filename
  const originalName = fileEntry.name || 'audio.bin'
  const inputExt = originalName.includes('.')
    ? originalName.split('.').pop()!.toLowerCase()
    : 'bin'

  // 3. Convert to Buffer
  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // 4. Build ffmpeg args
  const ffmpegArgs: string[] = []
  if (bitrate) {
    ffmpegArgs.push('-b:a', `${bitrate}k`)
  }

  // 5. Process
  let outputBuffer: Buffer
  try {
    outputBuffer = await processWithFFmpeg(inputBuffer, inputExt, ffmpegArgs, format)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FFmpeg processing failed'
    return Response.json({ error: message }, { status: 422 })
  }

  // 6. Return binary response
  return new Response(new Uint8Array(outputBuffer), {
    headers: {
      'Content-Type': `audio/${format}`,
      'Content-Disposition': `attachment; filename="converted.${format}"`,
      'Content-Length': String(outputBuffer.byteLength),
    },
  })
}
