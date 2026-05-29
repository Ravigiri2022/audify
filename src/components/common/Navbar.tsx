'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AudioLines, Menu, X, LayoutDashboard, Library, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/tools', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
]

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }
  if (email) return email[0].toUpperCase()
  return 'U'
}

export function Navbar() {
  const { user, profile, signOut } = useAuthStore()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = React.useState(false)

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
            <AudioLines size={22} className="text-brand" />
            <span className="text-lg font-bold text-gradient">Audify</span>
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {profile?.full_name ?? user.email}
                    </p>
                    {profile?.full_name && (
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard size={14} />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library" className="flex items-center gap-2">
                      <Library size={14} />
                      Library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings size={14} />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-error focus:text-error focus:bg-error/10 gap-2"
                    onSelect={handleSignOut}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="hidden md:inline-flex">
                <Link href="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden border-t border-bg-border bg-bg-base/95 backdrop-blur-md overflow-hidden transition-all duration-200',
          mobileOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Button asChild size="sm" className="mt-2 w-full">
              <Link href="/auth" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
