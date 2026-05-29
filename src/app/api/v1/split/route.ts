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
  const timestampsRaw = formData.get('timestamps') as string | null
  const splitIndexRaw = formData.get('split_index') as string | null

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  if (!timestampsRaw) {
    return Response.json(
      { error: 'Missing required field: timestamps (JSON array of seconds, e.g. [30, 60, 90])' },
      { status: 400 }
    )
  }

  // Parse timestamps JSON array
  let timestamps: number[]
  try {
    const parsed = JSON.parse(timestampsRaw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Must be a non-empty array')
    }
    timestamps = parsed.map((v: unknown) => {
      const n = Number(v)
      if (!Number.isFinite(n) || n <= 0) throw new Error(`Invalid timestamp value: ${v}`)
      return n
    })
    // Ensure sorted ascending
    timestamps.sort((a, b) => a - b)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Parse error'
    return Response.json(
      { error: `Invalid "timestamps" JSON: ${msg}` },
      { status: 400 }
    )
  }

  // Determine segment index to return (default 0)
  const splitIndex = splitIndexRaw !== null && splitIndexRaw !== ''
    ? Number(splitIndexRaw)
    : 0

  // Segments: [0, ts[0]], [ts[0], ts[1]], ..., [ts[n-1], end]
  // Total segments = timestamps.length + 1
  const totalSegments = timestamps.length + 1

  if (!Number.isInteger(splitIndex) || splitIndex < 0 || splitIndex >= totalSegments) {
    return Response.json(
      {
        error: `Field "split_index" must be an integer between 0 and ${totalSegments - 1} for the provided timestamps`,
      },
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

  // Determine start/end for the requested segment
  // Use 0 as the implicit start and a very large number as the implicit end
  const segmentStart = splitIndex === 0 ? 0 : timestamps[splitIndex - 1]
  const segmentEnd = splitIndex < timestamps.length ? timestamps[splitIndex] : null // null = to end of file

  // 4. Build FFmpeg args
  // -ss <start> -to <end> -c copy  (or just -ss <start> -c copy if end is the file end)
  const ffmpegArgs: string[] = ['-ss', String(segmentStart)]
  if (segmentEnd !== null) {
    ffmpegArgs.push('-to', String(segmentEnd))
  }
  ffmpegArgs.push('-c', 'copy')

  // 5. Process
  let outputBuffer: Buffer
  try {
    outputBuffer = await processWithFFmpeg(inputBuffer, inputExt, ffmpegArgs, inputExt)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FFmpeg processing failed'
    return Response.json({ error: message }, { status: 422 })
  }

  // 6. Return the single segment with metadata headers
  return new Response(new Uint8Array(outputBuffer), {
    headers: {
      'Content-Type': `audio/${inputExt}`,
      'Content-Disposition': `attachment; filename="segment_${splitIndex}.${inputExt}"`,
      'Content-Length': String(outputBuffer.byteLength),
      'X-Segment-Index': String(splitIndex),
      'X-Total-Segments': String(totalSegments),
      'X-Segment-Start': String(segmentStart),
      ...(segmentEnd !== null ? { 'X-Segment-End': String(segmentEnd) } : {}),
    },
  })
}
