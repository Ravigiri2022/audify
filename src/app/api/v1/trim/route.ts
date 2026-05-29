import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import { processWithFFmpeg } from '../_lib/process'

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
  const startRaw = formData.get('start') as string | null
  const endRaw = formData.get('end') as string | null

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  if (startRaw === null || startRaw === '') {
    return Response.json({ error: 'Missing required field: start (seconds)' }, { status: 400 })
  }

  if (endRaw === null || endRaw === '') {
    return Response.json({ error: 'Missing required field: end (seconds)' }, { status: 400 })
  }

  const start = Number(startRaw)
  const end = Number(endRaw)

  if (!Number.isFinite(start) || start < 0) {
    return Response.json({ error: 'Field "start" must be a non-negative number' }, { status: 400 })
  }

  if (!Number.isFinite(end) || end <= start) {
    return Response.json({ error: 'Field "end" must be a number greater than "start"' }, { status: 400 })
  }

  const originalName = fileEntry.name || 'audio.bin'
  const inputExt = originalName.includes('.')
    ? originalName.split('.').pop()!.toLowerCase()
    : 'bin'

  // 3. Convert to Buffer
  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // 4. FFmpeg args: seek to start, stop at end, stream-copy (no re-encode)
  // -ss and -to are placed as output options here (after input) for frame-accurate trimming
  const ffmpegArgs = ['-ss', String(start), '-to', String(end), '-c', 'copy']

  // 5. Process
  let outputBuffer: Buffer
  try {
    outputBuffer = await processWithFFmpeg(inputBuffer, inputExt, ffmpegArgs, inputExt)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FFmpeg processing failed'
    return Response.json({ error: message }, { status: 422 })
  }

  // 6. Return binary response with the same format as the input
  return new Response(new Uint8Array(outputBuffer), {
    headers: {
      'Content-Type': `audio/${inputExt}`,
      'Content-Disposition': `attachment; filename="trimmed.${inputExt}"`,
      'Content-Length': String(outputBuffer.byteLength),
    },
  })
}
