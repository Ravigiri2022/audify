import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free & Pro Plans',
  description:
    'Wavlovesme is free to use. Upgrade to Pro for unlimited operations, 500 MB files, batch processing, and Developer API access. No hidden fees.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Wavlovesme',
    description: 'Start free. Upgrade to Pro for unlimited audio processing. Simple, transparent pricing.',
    url: '/pricing',
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
