'use client'

import * as React from 'react'
import Link from 'next/link'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth.store'

export function GuestBanner() {
  const { user, isLoading } = useAuthStore()

  if (isLoading || user) return null

  return (
    <div className="w-full rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
      <p className="text-sm text-text-secondary text-center sm:text-left">
        Sign in to save your files and access your history.
      </p>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/auth" className="flex items-center gap-1.5">
          <LogIn size={14} />
          Sign In
        </Link>
      </Button>
    </div>
  )
}

export default GuestBanner
