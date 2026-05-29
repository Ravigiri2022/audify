'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for occasional use',
    cta: 'Start for Free',
    href: '/tools',
    highlight: false,
    features: [
      '10 operations per day',
      '50 MB max file size',
      'All 19 audio tools',
      '1 day file history',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9,
    annualPrice: 7.5,
    description: 'For power users and creators',
    cta: 'Upgrade to Pro',
    href: '/auth',
    highlight: true,
    features: [
      'Unlimited operations',
      '500 MB max file size',
      'All 19 audio tools',
      '30 day file history',
      'Batch processing',
      'API access',
      'Priority support',
    ],
  },
] as const

const FEATURE_COMPARISON = [
  { feature: 'Audio tools', free: '19 tools', pro: '19 tools' },
  { feature: 'Daily operations', free: '10 / day', pro: 'Unlimited' },
  { feature: 'Max file size', free: '50 MB', pro: '500 MB' },
  { feature: 'File history', free: '1 day', pro: '30 days' },
  { feature: 'Batch processing', free: false, pro: true },
  { feature: 'API access', free: false, pro: true },
  { feature: 'Priority support', free: false, pro: true },
  { feature: 'Privacy (client-side)', free: true, pro: true },
]

const FAQS = [
  {
    q: 'Does my audio get uploaded to your servers?',
    a: 'No. Every audio operation runs entirely inside your browser using WebAssembly. Your files never leave your device — not even a byte is sent to our servers.',
  },
  {
    q: 'Can I cancel my Pro subscription at any time?',
    a: "Yes. Cancel anytime from your account settings and you'll retain Pro access until the end of your current billing period. No questions asked.",
  },
  {
    q: 'What happens to my files after the history expires?',
    a: 'File history is metadata only (filename, size, processing date). The actual audio is processed locally and never stored on our servers. After the history window, records are deleted from your dashboard.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free plan gives you full access to all 19 tools with a daily limit — so you can fully evaluate Audify before upgrading.',
  },
  {
    q: 'What counts as an "operation"?',
    a: 'Each time you process a file — convert, trim, normalize, transcribe, etc. — that counts as one operation. Downloading a previously processed result does not count.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards and debit cards via Stripe. Annual billing saves you 2 months compared to monthly.',
  },
  {
    q: 'Can I use the API with the Free plan?',
    a: 'API access is a Pro-only feature. On the Free plan, all tools are available through the web interface.',
  },
  {
    q: 'Do you offer discounts for students or open-source projects?',
    a: "Yes — reach out via our support email and we'll sort you out. We love supporting students and open-source maintainers.",
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={easeOut}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold text-text-primary">Simple, transparent pricing</h1>
          <p className="mt-3 text-text-secondary">Start free, upgrade when you're ready.</p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-bg-border bg-bg-surface p-1">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                !isAnnual
                  ? 'bg-bg-elevated text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                isAnnual
                  ? 'bg-bg-elevated text-text-primary shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Annual
              <Badge className="bg-success/15 text-success border-success/25 text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Plan cards */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="mb-16 grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {PLANS.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                transition={easeOut}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlight
                    ? 'border-brand/40 bg-bg-surface shadow-glow'
                    : 'border-bg-border bg-bg-surface'
                }`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand to-brand-secondary text-white text-xs px-3">
                    Most Popular
                  </Badge>
                )}

                <div>
                  <p className={`text-sm font-semibold ${plan.highlight ? 'text-brand' : 'text-text-muted'}`}>
                    {plan.name}
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-text-primary">${price}</span>
                    <span className="mb-1 text-text-muted">/mo</span>
                  </div>
                  {isAnnual && plan.annualPrice > 0 && (
                    <p className="mt-1 text-xs text-text-muted">
                      Billed annually (${(plan.annualPrice * 12).toFixed(0)}/yr)
                    </p>
                  )}
                  <p className="mt-2 text-sm text-text-secondary">{plan.description}</p>
                </div>

                <Separator className="my-6 border-bg-border" />

                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-text-secondary">
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="mt-8 w-full"
                  size="lg"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={easeOut}
          className="mb-16"
        >
          <h2 className="mb-6 text-xl font-bold text-text-primary">Feature comparison</h2>
          <div className="overflow-hidden rounded-xl border border-bg-border bg-bg-surface">
            {/* Header row */}
            <div className="grid grid-cols-3 border-b border-bg-border bg-bg-elevated px-6 py-3">
              <div className="text-sm font-semibold text-text-muted">Feature</div>
              <div className="text-center text-sm font-semibold text-text-primary">Free</div>
              <div className="text-center text-sm font-semibold text-brand">Pro</div>
            </div>

            {FEATURE_COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 items-center px-6 py-3 ${
                  i !== FEATURE_COMPARISON.length - 1 ? 'border-b border-bg-border' : ''
                }`}
              >
                <div className="text-sm text-text-secondary">{row.feature}</div>
                <div className="flex justify-center">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-text-muted" />
                    )
                  ) : (
                    <span className="text-sm text-text-secondary">{row.free}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {typeof row.pro === 'boolean' ? (
                    row.pro ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <X className="h-4 w-4 text-text-muted" />
                    )
                  ) : (
                    <span className="text-sm font-medium text-text-primary">{row.pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={easeOut}
          className="mb-16"
        >
          <h2 className="mb-6 text-xl font-bold text-text-primary">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-bg-border bg-bg-surface px-5"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-text-primary hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-text-secondary pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          transition={easeOut}
          className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-brand-secondary/5 p-10 text-center"
        >
          <h2 className="text-2xl font-bold text-text-primary">Ready to transform your audio?</h2>
          <p className="mt-3 text-text-secondary">
            Start free today. No credit card required.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/tools">Start for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
