import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthInitializer } from '@/components/providers/AuthInitializer'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Audify',
  description:
    'Browser-based audio toolkit. Convert, trim, enhance, transcribe and analyze audio — 100% client-side. Your files never leave your device.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <body>
        <QueryProvider>
          <AuthInitializer />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'hsl(var(--bg-surface))',
                border: '1px solid hsl(var(--bg-border))',
                color: 'hsl(var(--text-primary))',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
