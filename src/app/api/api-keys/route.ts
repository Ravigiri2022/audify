import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import type { ApiKey } from '@/types/api.types'

const BCRYPT_ROUNDS = 10

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
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, is_active, created_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data as ApiKey[], error: null })
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

  let body: { name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON body' }, { status: 400 })
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json({ data: null, error: 'Missing required field: name' }, { status: 400 })
  }

  // Generate key: aud_ + 32 random hex chars (total 36 chars)
  const randomHex = randomBytes(16).toString('hex') // 32 hex chars
  const plainKey = `aud_${randomHex}`
  const keyPrefix = plainKey.slice(0, 10) // "aud_" + first 6 hex chars

  // Hash key with bcrypt
  const keyHash = await bcrypt.hash(plainKey, BCRYPT_ROUNDS)

  const { data: apiKey, error: insertError } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
    })
    .select('id, name, key_prefix, last_used_at, is_active, created_at')
    .single()

  if (insertError) {
    return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
  }

  // Return the plain key in the response — this is the ONLY time it is sent
  return NextResponse.json(
    {
      data: {
        ...(apiKey as ApiKey),
        key: plainKey,
      },
      error: null,
    },
    { status: 201 }
  )
}
