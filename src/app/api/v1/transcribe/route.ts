import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import OpenAI, { toFile } from 'openai'

export async function POST(request: NextRequest) {
  // 1. Validate API key
  const ctx = await validateApiKey(request)
  if (isErrorResponse(ctx)) return ctx

  // 2. Check for OpenAI API key before doing any work
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'Transcription service is currently unavailable (OpenAI API key not configured)' },
      { status: 503 }
    )
  }

  // 3. Parse multipart form data
  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json({ error: 'Failed to parse multipart form data' }, { status: 400 })
  }

  const fileEntry = formData.get('file')
  const language = (formData.get('language') as string | null)?.trim() || null

  if (!fileEntry || !(fileEntry instanceof File)) {
    return Response.json({ error: 'Missing required field: file' }, { status: 400 })
  }

  // 4. Convert to Buffer
  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  const originalName = fileEntry.name || 'audio.mp3'

  // 5. Transcribe via OpenAI Whisper API
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let transcription: any
  try {
    const audioFile = await toFile(inputBuffer, originalName, { type: fileEntry.type || 'audio/mpeg' })

    transcription = await openai.audio.transcriptions.create({
      model: 'whisper-1',
      file: audioFile,
      ...(language ? { language } : {}),
      response_format: 'verbose_json',
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transcription failed'
    return Response.json({ error: message }, { status: 422 })
  }

  // 6. Return structured JSON
  return Response.json({
    text: transcription.text,
    language: transcription.language,
    duration: transcription.duration,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    segments: (transcription.segments ?? []).map((seg: any) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text,
    })),
  })
}
