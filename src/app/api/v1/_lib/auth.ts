import { createServiceClient } from '@/lib/supabase/server'
import type { Plan } from '@/types/user.types'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'

export interface ApiContext {
  userId: string
  apiKeyId: string
  plan: Plan
}

export async function validateApiKey(
  request: NextRequest
): Promise<ApiContext | NextResponse> {
  // 1. Extract Bearer token from Authorization header
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid Authorization header. Expected: Bearer <api_key>' },
      { status: 401 }
    )
  }

  const plainKey = authHeader.slice(7).trim()
  if (!plainKey) {
    return NextResponse.json(
      { error: 'API key must not be empty' },
      { status: 401 }
    )
  }

  const supabase = createServiceClient()

  // 2. Fetch all active api_keys that share the same prefix for efficient lookup
  //    (avoid full table bcrypt scan — narrow by prefix first)
  const keyPrefix = plainKey.slice(0, 10)

  const { data: candidates, error: fetchError } = await supabase
    .from('api_keys')
    .select('id, user_id, key_hash, is_active')
    .eq('key_prefix', keyPrefix)
    .eq('is_active', true)

  if (fetchError) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }

  if (!candidates || candidates.length === 0) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    )
  }

  // bcrypt.compare the plain key against each candidate hash
  let matchedKey: { id: string; user_id: string } | null = null
  for (const candidate of candidates) {
    const isMatch = await bcrypt.compare(plainKey, candidate.key_hash)
    if (isMatch) {
      matchedKey = { id: candidate.id, user_id: candidate.user_id }
      break
    }
  }

  if (!matchedKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    )
  }

  // 3. Get user profile and verify plan === 'pro'
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', matchedKey.user_id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json(
      { error: 'User profile not found' },
      { status: 401 }
    )
  }

  if (profile.plan !== 'pro') {
    return NextResponse.json(
      { error: 'Developer API access requires a Pro plan' },
      { status: 403 }
    )
  }

  // 4. Update last_used_at on the api_key (fire-and-forget, don't block response)
  supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', matchedKey.id)
    .then(() => {})

  // 5. Log to api_usage table (fire-and-forget)
  const endpoint = new URL(request.url).pathname
  supabase
    .from('api_usage')
    .insert({
      api_key_id: matchedKey.id,
      endpoint,
      status_code: 200,
    })
    .then(() => {})

  // 6. Return ApiContext
  return {
    userId: matchedKey.user_id,
    apiKeyId: matchedKey.id,
    plan: profile.plan as Plan,
  }
}

/** Type guard: returns true when validateApiKey returned an error response */
export function isErrorResponse(
  result: ApiContext | NextResponse
): result is NextResponse {
  return result instanceof NextResponse
}
