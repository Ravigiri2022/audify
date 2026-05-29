import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UsageStats } from '@/types/api.types'
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

  // Fetch profile for plan, today counter, and storage
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan, operations_today, last_reset_date, storage_used_bytes')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ data: null, error: 'Profile not found' }, { status: 404 })
  }

  // Compute month count from operations table
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthCount, error: countError } = await supabase
    .from('operations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString())

  if (countError) {
    return NextResponse.json({ data: null, error: countError.message }, { status: 500 })
  }

  const plan = profile.plan as 'free' | 'pro'
  const planLimits = PLAN_LIMITS[plan]

  // If last_reset_date is before today, the operations_today counter is stale;
  // report 0 until the next log resets it
  const today = new Date().toISOString().split('T')[0]
  const todayCount =
    profile.last_reset_date === today ? (profile.operations_today ?? 0) : 0

  const stats: UsageStats = {
    today: todayCount,
    month: monthCount ?? 0,
    plan,
    limit: planLimits.opsPerDay === Infinity ? -1 : planLimits.opsPerDay,
    storage_used_bytes: profile.storage_used_bytes ?? 0,
  }

  return NextResponse.json({ data: stats, error: null })
}
