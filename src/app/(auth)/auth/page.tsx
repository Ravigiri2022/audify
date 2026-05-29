'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AudioLines, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth.store'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
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

export default function AuthPage() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    }
  }, [user, router])

  async function signInWith(provider: 'google' | 'github') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      {/* Background orb */}
      <div
        className="pointer-events-none fixed left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-15"
        style={{
          background:
            'radial-gradient(circle, hsl(258 90% 62% / 0.5) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="rounded-2xl border border-bg-border bg-bg-surface p-8 shadow-md"
        >
          {/* Logo */}
          <motion.div
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.05 }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-brand-secondary/20 ring-1 ring-brand/30">
              <AudioLines className="h-6 w-6 text-brand" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-text-primary">Welcome to Wavlovesme</h1>
              <p className="mt-1 text-sm text-text-secondary">Sign in to save your work and unlock Pro features</p>
            </div>
          </motion.div>

          {/* OAuth buttons */}
          <motion.div
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.1 }}
            className="flex flex-col gap-3"
          >
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-bg-border hover:bg-bg-elevated"
              onClick={() => signInWith('google')}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-bg-border hover:bg-bg-elevated"
              onClick={() => signInWith('github')}
            >
              <GitHubIcon />
              Continue with GitHub
            </Button>
          </motion.div>

          {/* Privacy note */}
          <motion.div
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.15 }}
            className="mt-6 flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3"
          >
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
            <p className="text-xs text-text-muted leading-relaxed">
              Audio processing always runs locally in your browser — we only use Google/GitHub for
              account authentication.
            </p>
          </motion.div>

          <motion.p
            variants={fadeUp}
            transition={{ ...easeOut, delay: 0.2 }}
            className="mt-5 text-center text-xs text-text-muted"
          >
            By signing in you agree to our{' '}
            <a href="#" className="text-brand hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-brand hover:underline">
              Privacy Policy
            </a>
            .
          </motion.p>
        </motion.div>

        {/* Use without account */}
        <motion.p
          variants={fadeUp}
          transition={{ ...easeOut, delay: 0.25 }}
          className="mt-4 text-center text-sm text-text-muted"
        >
          No account?{' '}
          <a href="/tools" className="text-brand hover:underline">
            Use tools without signing in
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
