import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { LibraryFile, SaveFilePayload } from '@/types/api.types'
import { PLAN_LIMITS } from '@/types/user.types'

export async function GET() {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('operations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data as LibraryFile[], error: null })
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

  let body: SaveFilePayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 })
  }

  const { tool, input_filename, output_filename, input_size_bytes, output_size_bytes, processing_ms, storage_path } = body

  if (!tool || !input_filename) {
    return NextResponse.json(
      { data: null, error: 'Missing required fields: tool, input_filename' },
      { status: 400 }
    )
  }

  // Fetch profile to determine plan and current storage usage
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, storage_used_bytes')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
  }

  const historyDays = PLAN_LIMITS[profile.plan as 'free' | 'pro'].historyDays
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + historyDays)

  const { data: operation, error: insertError } = await supabase
    .from('operations')
    .insert({
      user_id: user.id,
      tool,
      input_filename,
      output_filename,
      input_size_bytes,
      output_size_bytes,
      processing_ms,
      storage_path: storage_path ?? null,
      status: 'completed',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (insertError) {
    return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
  }

  // Increment storage_used_bytes on profile
  const bytesAdded = (output_size_bytes ?? 0)
  if (bytesAdded > 0) {
    const newStorageUsed = (profile.storage_used_bytes ?? 0) + bytesAdded
    await supabase
      .from('profiles')
      .update({ storage_used_bytes: newStorageUsed })
      .eq('id', user.id)
  }

  return NextResponse.json({ data: operation as LibraryFile, error: null }, { status: 201 })
}
