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

  // Fetch the operation first to verify ownership and get storage info
  const { data: operation, error: fetchError } = await supabase
    .from('operations')
    .select('id, user_id, storage_path, output_size_bytes')
    .eq('id', id)
    .single()

  if (fetchError || !operation) {
    return NextResponse.json({ data: null, error: 'Operation not found' }, { status: 404 })
  }

  if (operation.user_id !== user.id) {
    return NextResponse.json({ data: null, error: 'Forbidden' }, { status: 403 })
  }

  // Delete file from Supabase Storage if a storage path exists
  if (operation.storage_path) {
    const { error: storageError } = await supabase.storage
      .from('audify-files')
      .remove([operation.storage_path])

    if (storageError) {
      // Log but don't block the DB delete — the record should still be removed
      console.error('Storage delete error:', storageError.message)
    }
  }

  // Delete the operation record
  const { error: deleteError } = await supabase
    .from('operations')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ data: null, error: deleteError.message }, { status: 500 })
  }

  // Decrement storage_used_bytes on profile
  const bytesFreed = operation.output_size_bytes ?? 0
  if (bytesFreed > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('storage_used_bytes')
      .eq('id', user.id)
      .single()

    if (profile) {
      const newStorageUsed = Math.max(0, (profile.storage_used_bytes ?? 0) - bytesFreed)
      await supabase
        .from('profiles')
        .update({ storage_used_bytes: newStorageUsed })
        .eq('id', user.id)
    }
  }

  return NextResponse.json({ data: { id }, error: null })
}
