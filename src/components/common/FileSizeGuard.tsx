'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowUpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'
import { PLAN_LIMITS } from '@/types/user.types'
import type { Plan } from '@/types/user.types'

interface FileSizeGuardProps {
  fileSize: number | null
  userPlan?: Plan
  children: React.ReactNode
}

export function FileSizeGuard({ fileSize, userPlan, children }: FileSizeGuardProps) {
  const { profile } = useAuthStore()
  const plan: Plan = userPlan ?? profile?.plan ?? 'free'
  const limitBytes = PLAN_LIMITS[plan].maxFileSizeMb * 1024 * 1024
  const exceeds = fileSize != null && fileSize > limitBytes

  if (!exceeds) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-bg-base/80 backdrop-blur-sm border border-warning/30 p-6">
        <div className="flex flex-col items-center gap-3 text-center max-w-xs">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/15">
            <AlertTriangle size={20} className="text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">File too large</p>
            <p className="mt-1 text-xs text-text-secondary">
              This file exceeds the {PLAN_LIMITS[plan].maxFileSizeMb} MB limit for the{' '}
              <span className="font-medium capitalize">{plan}</span> plan.
            </p>
          </div>
          {plan === 'free' && (
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/pricing">
                <ArrowUpCircle size={14} />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileSizeGuard
