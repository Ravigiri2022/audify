export type Plan = 'free' | 'pro'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  plan: Plan
  operations_today: number
  last_reset_date: string
  storage_used_bytes: number
  created_at: string
}

export const PLAN_LIMITS: Record<Plan, { opsPerDay: number; maxFileSizeMb: number; historyDays: number }> = {
  free: { opsPerDay: 10, maxFileSizeMb: 50, historyDays: 1 },
  pro: { opsPerDay: Infinity, maxFileSizeMb: 500, historyDays: 30 },
}
