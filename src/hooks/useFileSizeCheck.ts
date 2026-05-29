'use client'

import { useAuthStore } from '@/store/auth.store'
import { PLAN_LIMITS } from '@/types/user.types'

export function useFileSizeCheck(fileSize: number | null) {
  const { profile } = useAuthStore()
  const plan = profile?.plan ?? 'free'
  const limitBytes = PLAN_LIMITS[plan].maxFileSizeMb * 1024 * 1024
  const exceeds = fileSize !== null && fileSize > limitBytes

  return { exceeds, limitMb: PLAN_LIMITS[plan].maxFileSizeMb, plan }
}
