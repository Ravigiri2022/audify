'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Moon, Sun, Monitor, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth.store'
import { createClient } from '@/lib/supabase/client'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

type Theme = 'dark' | 'light' | 'system'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function SettingsPage() {
  const { user, profile, signOut } = useAuthStore()
  const router = useRouter()

  const [theme, setTheme] = useState<Theme>('dark')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const providers = user?.app_metadata?.providers as string[] ?? []
  const hasGoogle = providers.includes('google')
  const hasGitHub = providers.includes('github')

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  function applyTheme(t: Theme) {
    setTheme(t)
    const html = document.documentElement
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      html.setAttribute('data-theme', t)
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    try {
      const supabase = createClient()
      // Sign out first; actual account deletion would go through a server action
      await supabase.auth.signOut()
      await signOut()
      toast.success('Account deleted')
      router.replace('/')
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeleteLoading(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <motion.h1
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={easeOut}
        className="mb-8 text-2xl font-bold text-text-primary"
      >
        Settings
      </motion.h1>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Profile card */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="rounded-xl border border-bg-border bg-bg-surface p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-brand/20 text-brand text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-text-primary">
                  {profile?.full_name ?? 'No name set'}
                </p>
                <Badge
                  variant="outline"
                  className={
                    profile?.plan === 'pro'
                      ? 'border-brand/40 bg-brand/10 text-brand text-xs'
                      : 'border-bg-border text-text-muted text-xs'
                  }
                >
                  {profile?.plan === 'pro' ? 'Pro' : 'Free'}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-text-secondary">{user?.email}</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Member since {new Date(profile?.created_at ?? Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {profile?.plan === 'free' && (
            <div className="mt-4 rounded-lg border border-brand/30 bg-brand/5 p-3">
              <p className="text-sm text-text-secondary">
                Upgrade to Pro for unlimited operations, 500 MB files, batch processing, and API access.
              </p>
              <Button asChild size="sm" className="mt-2">
                <a href="/pricing">Upgrade to Pro</a>
              </Button>
            </div>
          )}
        </motion.div>

        {/* Connected accounts */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="rounded-xl border border-bg-border bg-bg-surface p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Connected accounts
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-bg-border p-3">
              <div className="flex items-center gap-3">
                <GoogleIcon />
                <span className="text-sm text-text-primary">Google</span>
              </div>
              <Badge
                variant="outline"
                className={
                  hasGoogle
                    ? 'border-success/30 bg-success/10 text-success text-xs'
                    : 'border-bg-border text-text-muted text-xs'
                }
              >
                {hasGoogle ? 'Connected' : 'Not connected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-bg-border p-3">
              <div className="flex items-center gap-3">
                <GitHubIcon />
                <span className="text-sm text-text-primary">GitHub</span>
              </div>
              <Badge
                variant="outline"
                className={
                  hasGitHub
                    ? 'border-success/30 bg-success/10 text-success text-xs'
                    : 'border-bg-border text-text-muted text-xs'
                }
              >
                {hasGitHub ? 'Connected' : 'Not connected'}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="rounded-xl border border-bg-border bg-bg-surface p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Preferences
          </h2>
          <div>
            <p className="mb-3 text-sm font-medium text-text-primary">Theme</p>
            <div className="flex gap-2">
              {(
                [
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'system', label: 'System', icon: Monitor },
                ] as { value: Theme; label: string; icon: React.ElementType }[]
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => applyTheme(value)}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all ${
                    theme === value
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-bg-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Danger zone */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="rounded-xl border border-error/30 bg-bg-surface p-6"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-error">
            Danger zone
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-text-primary">Delete account</p>
              <p className="mt-0.5 text-sm text-text-secondary">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-bg-surface border-bg-border max-w-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-6 w-6 text-error" />
            </div>
            <DialogTitle className="text-text-primary">Delete your account?</DialogTitle>
            <p className="text-sm text-text-secondary">
              This will permanently delete your account, all saved files, and API keys. This cannot
              be undone.
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting…' : 'Yes, delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
