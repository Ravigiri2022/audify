'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Package, Lock, ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import ToolCard from '@/components/common/ToolCard'
import { TOOLS, TOOL_CATEGORIES } from '@/lib/constants'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

const ALL_CATEGORIES = ['All', ...TOOL_CATEGORIES] as const
type CategoryFilter = (typeof ALL_CATEGORIES)[number]

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')

  const filteredTools =
    activeCategory === 'All'
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory)

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        {/* Animated gradient orb */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, hsl(258 90% 62% / 0.6) 0%, hsl(210 100% 56% / 0.3) 50%, transparent 70%)',
            animation: 'pulse_ring 6s ease-in-out infinite',
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0 }}
          >
            <Badge
              variant="outline"
              className="mb-6 inline-flex items-center gap-1.5 border-brand/30 bg-brand/10 px-3 py-1 text-brand"
            >
              <Lock className="h-3 w-3" />
              100% Client-side Processing
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0.08 }}
            className="text-5xl font-extrabold tracking-tight text-text-primary sm:text-6xl lg:text-7xl"
          >
            Transform Your Audio
            <br />
            <span className="text-gradient">in the Browser</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary"
          >
            19 powerful audio tools that run entirely in your browser. No uploads, no servers,
            no privacy risks — your audio never leaves your device.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0.24 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="group gap-2">
              <Link href="/tools">
                Start for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/tools">View all tools</Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0.32 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/10 px-4 py-2 text-sm text-success"
          >
            <Lock className="h-3.5 w-3.5" />
            Audio never leaves your device
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-bg-border bg-bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-3 divide-x divide-bg-border text-center"
          >
            {[
              { value: '19', label: 'Audio Tools' },
              { value: '0', label: 'Server Calls' },
              { value: '100%', label: 'Private' },
            ].map(({ value, label }) => (
              <motion.div key={label} variants={fadeUp} className="px-4 py-2">
                <p className="text-2xl font-bold text-gradient">{value}</p>
                <p className="mt-0.5 text-sm text-text-secondary">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tools grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary">Everything you need for audio</h2>
          <p className="mt-3 text-text-secondary">
            Convert, edit, enhance, analyze — all without leaving your browser.
          </p>
        </motion.div>

        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? 'bg-brand text-white shadow-glow'
                  : 'bg-bg-elevated text-text-secondary hover:bg-bg-border hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Staggered grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={stagger}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredTools.map((tool, i) => (
              <motion.div key={tool.slug} variants={fadeUp} transition={easeOut}>
                <ToolCard tool={tool} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── Features ── */}
      <section className="border-y border-bg-border bg-bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {[
              {
                icon: Shield,
                title: 'Privacy First',
                desc: 'Every operation runs in WebAssembly inside your browser tab. Zero data is transmitted to any server.',
              },
              {
                icon: Zap,
                title: 'Instant Results',
                desc: 'No upload wait times. Processing starts the moment you drop a file — results in seconds.',
              },
              {
                icon: Package,
                title: '19 Powerful Tools',
                desc: 'From format conversion and noise removal to BPM detection and AI transcription — everything audio.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                transition={easeOut}
                className="flex flex-col items-center gap-4 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand-secondary/20 ring-1 ring-brand/20">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                  <p className="mt-2 text-sm text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing preview ── */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl font-bold text-text-primary">Simple, transparent pricing</h2>
          <p className="mt-3 text-text-secondary">Start free. Upgrade when you need more.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
        >
          {/* Free */}
          <motion.div
            variants={fadeUp}
            transition={easeOut}
            className="rounded-2xl border border-bg-border bg-bg-surface p-6"
          >
            <p className="text-sm font-medium text-text-muted">Free</p>
            <p className="mt-2 text-4xl font-bold text-text-primary">$0</p>
            <p className="mt-1 text-sm text-text-secondary">Forever</p>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {['10 operations / day', '50 MB file limit', '19 audio tools', '1 day history'].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-brand shrink-0" />
                    {f}
                  </li>
                )
              )}
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link href="/tools">Get Started</Link>
            </Button>
          </motion.div>

          {/* Pro */}
          <motion.div
            variants={fadeUp}
            transition={easeOut}
            className="relative rounded-2xl border border-brand/40 bg-bg-surface p-6 shadow-glow"
          >
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand to-brand-secondary text-white">
              Most Popular
            </Badge>
            <p className="text-sm font-medium text-brand">Pro</p>
            <p className="mt-2 text-4xl font-bold text-text-primary">$9</p>
            <p className="mt-1 text-sm text-text-secondary">per month</p>
            <ul className="mt-6 space-y-2 text-sm text-text-secondary">
              {[
                'Unlimited operations',
                '500 MB file limit',
                'All tools + batch processing',
                '30 day history',
                'API access',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-brand shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="/pricing">See full pricing</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
