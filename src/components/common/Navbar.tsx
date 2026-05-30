'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart, Menu, X, LayoutDashboard, Library, Settings,
  LogOut, Zap, Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import { PLAN_LIMITS } from '@/types/user.types'

const NAV_LINKS = [
  { href: '/tools', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
]

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
  if (email) return email[0].toUpperCase()
  return 'U'
}

function OpsCounter({ used, total }: { used: number; total: number }) {
  const remaining = Math.max(0, total - used)
  const pct = Math.min(100, (used / total) * 100)
  const isLow = remaining <= 2
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-bg-border bg-bg-elevated px-2.5 py-1">
      <Zap size={11} className={isLow ? 'text-warning' : 'text-brand'} />
      <span className={cn('text-xs font-mono tabular-nums', isLow ? 'text-warning' : 'text-text-muted')}>
        {remaining}/{total}
      </span>
      <div className="h-1 w-12 rounded-full bg-bg-border overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isLow ? 'bg-warning' : 'bg-brand')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isPro = profile?.plan === 'pro'
  const opsLimit = PLAN_LIMITS[profile?.plan ?? 'free'].opsPerDay
  const opsUsed = profile?.operations_today ?? 0

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-base/80 backdrop-blur-md border-b border-bg-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand/25 to-brand-secondary/20 ring-1 ring-brand/30">
              <Heart size={14} fill="currentColor" className="text-brand" />
            </div>
            <span className="flex items-center gap-0.5 text-base font-extrabold tracking-tight text-gradient">
              wav
              <Heart size={11} fill="currentColor" className="text-error -mt-0.5" />
              me
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Ops counter — free logged-in users */}
            {user && !isPro && opsLimit !== Infinity && (
              <div className="hidden md:block">
                <OpsCounter used={opsUsed} total={opsLimit} />
              </div>
            )}

            {/* Pro badge */}
            {user && isPro && (
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand/20 to-brand-secondary/20 px-2.5 py-1 text-[11px] font-bold text-brand ring-1 ring-brand/30">
                <Crown size={10} /> Pro
              </span>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? 'User'} />
                      <AvatarFallback className="text-xs">
                        {getInitials(profile?.full_name, user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {profile?.full_name ?? user.email}
                        </p>
                        {profile?.full_name && (
                          <p className="text-xs text-text-muted truncate">{user.email}</p>
                        )}
                      </div>
                      <span className={cn(
                        'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                        isPro ? 'bg-brand/15 text-brand' : 'bg-bg-border text-text-muted',
                      )}>
                        {isPro ? 'Pro' : 'Free'}
                      </span>
                    </div>
                    {/* Ops counter in dropdown on mobile */}
                    {!isPro && opsLimit !== Infinity && (
                      <div className="mt-2">
                        <OpsCounter used={opsUsed} total={opsLimit} />
                      </div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard size={14} /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library" className="flex items-center gap-2">
                      <Library size={14} /> Library
                      {!isPro && (
                        <span className="ml-auto rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-bold text-brand">Pro</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings size={14} /> Settings
                    </Link>
                  </DropdownMenuItem>
                  {!isPro && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/pricing" className="flex items-center gap-2 text-brand font-medium">
                          <Crown size={14} /> Upgrade to Pro
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-error focus:text-error focus:bg-error/10 gap-2"
                    onSelect={handleSignOut}
                  >
                    <LogOut size={14} /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}

            <Button
              variant="ghost" size="icon" className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden border-t border-bg-border bg-bg-base/95 backdrop-blur-md overflow-hidden transition-all duration-200',
        mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0',
      )}>
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Button asChild size="sm" className="mt-2 w-full">
              <Link href="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
