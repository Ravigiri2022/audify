import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface LogOperationPayload {
  tool: string
  input_filename: string
  output_filename?: string
  input_size_bytes?: number
  output_size_bytes?: number
  processing_ms?: number
  storage_path?: string
  status?: 'completed' | 'failed'
}

export async function POST(request: Request) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  let body: LogOperationPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    tool,
    input_filename,
    output_filename,
    input_size_bytes,
    output_size_bytes,
    processing_ms,
    storage_path,
    status = 'completed',
  } = body

  if (!tool || !input_filename) {
    return NextResponse.json(
      { data: null, error: 'Missing required fields: tool, input_filename' },
      { status: 400 }
    )
  }

  // Insert operation record
  const { data: operation, error: insertError } = await supabase
    .from('operations')
    .insert({
      user_id: user.id,
      tool,
      input_filename,
      output_filename: output_filename ?? null,
      input_size_bytes: input_size_bytes ?? null,
      output_size_bytes: output_size_bytes ?? null,
      processing_ms: processing_ms ?? null,
      storage_path: storage_path ?? null,
      status,
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
  }

  // Update operations_today on profile, resetting if the date has rolled over
  const today = new Date().toISOString().split('T')[0]

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('operations_today, last_reset_date')
    .eq('id', user.id)
    .single()

  if (!profileError && profile) {
    const isNewDay = profile.last_reset_date !== today
    const newCount = isNewDay ? 1 : (profile.operations_today ?? 0) + 1

    await supabase
      .from('profiles')
      .update({
        operations_today: newCount,
        last_reset_date: today,
      })
      .eq('id', user.id)
  }

  return NextResponse.json({ data: operation, error: null }, { status: 201 })
}
