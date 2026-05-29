import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: { id: string }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const supabase = createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  // Verify the key exists and belongs to the current user before deactivating
  const { data: existing, error: fetchError } = await supabase
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('id', id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ data: null, error: 'API key not found' }, { status: 404 })
  }

  if (existing.user_id !== user.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
  }

  if (!existing.is_active) {
    return NextResponse.json({ data: null, error: 'API key is already inactive' }, { status: 409 })
  }

  // Soft delete: set is_active = false
  const { error: updateError } = await supabase
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ data: null, error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ data: { id }, error: null })
}
