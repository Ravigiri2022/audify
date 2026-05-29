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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audflo.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Audflo — Free Online Audio Tools',
    template: '%s | Audflo',
  },
  description:
    'Free online audio toolkit. Convert, trim, compress, transcribe, remove background noise and more — all processed in your browser. No upload. No servers. 100% private.',
  keywords: [
    'free online audio converter',
    'audio trimmer online',
    'remove background noise online free',
    'audio transcription online free',
    'convert mp3 to wav online',
    'online audio tools',
    'audio compressor online free',
    'free audio editor online',
    'mp3 converter',
    'audio noise removal',
    'speech to text free',
    'online audio cutter',
    'audio normalizer online',
    'change audio speed online',
    'pitch shifter online free',
    'vocal remover online',
    'bpm detector online',
    'audio waveform visualizer',
    'audflo',
  ],
  authors: [{ name: 'Audflo' }],
  creator: 'Audflo',
  publisher: 'Audflo',
  category: 'Technology',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    siteName: 'Audflo',
    title: 'Audflo — Free Online Audio Tools',
    description:
      'Convert, trim, transcribe, and enhance audio — 100% in your browser. No upload. No servers. 19 free audio tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Audflo — Free Online Audio Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@audflo',
    creator: '@audflo',
    title: 'Audflo — Free Online Audio Tools',
    description:
      'Convert, trim, transcribe, and enhance audio — 100% in your browser. No upload. No servers. 19 free audio tools.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: APP_URL,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  other: {
    'google-site-verification': '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
