'use client'

import * as React from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'

function getInitialTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem('audify-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark')

  React.useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    document.documentElement.setAttribute('data-theme', initial)
  }, [])

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('audify-theme', next)
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      {theme === 'dark' ? (
        <Sun size={17} className="text-text-secondary" />
      ) : (
        <Moon size={17} className="text-text-secondary" />
      )}
    </Button>
  )
}
