import * as React from 'react'
import Link from 'next/link'
import { AudioLines, Lock } from 'lucide-react'

const FOOTER_LINKS = [
  { href: '/tools', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
  { href: 'https://github.com', label: 'GitHub', external: true },
]

export function Footer() {
  return (
    <footer className="border-t border-bg-border bg-bg-base">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:items-start">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <AudioLines size={20} className="text-brand" />
              <span className="text-base font-bold text-gradient">Audify</span>
            </Link>
            <p className="text-sm text-text-muted">Your audio, processed locally.</p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-xs text-success">
              <Lock size={10} />
              Audio never leaves your device
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="text-sm text-text-muted hover:text-text-primary transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-bg-border pt-6 text-center">
          <p className="text-xs text-text-muted">© 2025 Audflo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
