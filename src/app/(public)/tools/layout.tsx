import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Audio Tools — Convert, Trim, Transcribe & More',
  description:
    'Browse all 19 free online audio tools. Convert formats, trim files, remove noise, transcribe speech, detect BPM, and more — all in your browser with zero upload.',
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'All Audio Tools | Audflo',
    description: '19 free browser-based audio tools. No upload, no servers. 100% private.',
    url: '/tools',
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
