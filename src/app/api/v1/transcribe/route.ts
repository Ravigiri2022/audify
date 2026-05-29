import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import OpenAI, { toFile } from 'openai'

// Server-side transcription uses OpenAI Whisper directly.
// OpenRouter does not support audio transcription models.
// The browser-side transcription tool (Transformers.js) works without any API key.
// Add OPENAI_API_KEY to enable this Developer API endpoint.

export async function POST(request: NextRequest) {
  const ctx = await validateApiKey(request)
  if (isErrorResponse(ctx)) return ctx

  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error: 'Server-side transcription is not configured. Add OPENAI_API_KEY to enable this endpoint. The browser-based /tools/transcribe works without any key.',
        docs: 'https://platform.openai.com/api-keys',
      },
      { status: 503 }
    )
  }

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

  const arrayBuffer = await fileEntry.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)
  const originalName = fileEntry.name || 'audio.mp3'

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
