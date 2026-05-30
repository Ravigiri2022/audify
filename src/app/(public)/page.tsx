'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, Lock, ArrowRight, Cpu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import ToolCard from '@/components/common/ToolCard'
import { TOOLS, TOOL_CATEGORIES } from '@/lib/constants'
import { fadeUp, stagger, easeOut } from '@/lib/motion'
import { getLandingJsonLd } from '@/lib/seo'

const JSON_LD = getLandingJsonLd()

const ALL_CATEGORIES = ['All', ...TOOL_CATEGORIES] as const
type CategoryFilter = (typeof ALL_CATEGORIES)[number]

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')

  const filteredTools =
    activeCategory === 'All'
      ? TOOLS
      : TOOLS.filter((t) => t.category === activeCategory)

  return (
    <>
      {JSON_LD.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="min-h-screen bg-bg-base">
        <Navbar />

        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-4 pt-20 pb-12 sm:px-6 lg:px-8">
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/4 h-[500px] w-[500px] rounded-full opacity-15"
            style={{
              background:
                'radial-gradient(circle, hsl(258 90% 62% / 0.6) 0%, hsl(210 100% 56% / 0.3) 50%, transparent 70%)',
              animation: 'pulse_ring 6s ease-in-out infinite',
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ ...easeOut, delay: 0 }}>
              <Badge
                variant="outline"
                className="mb-5 inline-flex items-center gap-1.5 border-success/30 bg-success/10 px-3 py-1 text-success"
              >
                <Lock className="h-3 w-3" />
                No account needed · 100% free to use
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ ...easeOut, delay: 0.08 }}
              className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl"
            >
              Audio editing,
              <br />
              <span className="text-gradient">right in your browser</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ ...easeOut, delay: 0.14 }}
              className="mx-auto mt-5 max-w-xl text-base text-text-secondary"
            >
              Drop your file, pick a tool, done. {TOOLS.length} tools — convert, trim, merge, denoise, transcribe and more.
              Everything runs locally; your audio never leaves your device.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ ...easeOut, delay: 0.2 }}
              className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Button asChild size="lg" className="group gap-2 text-base px-6">
                <Link href="/tools/convert">
                  Try it now — free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-text-secondary hover:text-text-primary">
                <Link href="/tools">Browse all {TOOLS.length} tools</Link>
              </Button>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ ...easeOut, delay: 0.26 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              {[
                { icon: Lock, text: 'No uploads' },
                { icon: Cpu, text: 'Runs in WebAssembly' },
                { icon: Shield, text: 'Zero data sent' },
                { icon: Zap, text: 'Instant results' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Icon className="h-3.5 w-3.5 text-brand" />
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Tools grid ── */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-bold text-text-primary">Pick a tool and start</h2>
            <p className="mt-2 text-sm text-text-secondary">
              No sign-up required. Drop a file and go.
            </p>
          </motion.div>

          {/* Category tabs */}
          <div className="mb-7 flex flex-wrap justify-center gap-2">
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

        {/* ── Why it works ── */}
        <section className="border-y border-bg-border bg-bg-surface">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
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
                  title: 'Stays on your device',
                  desc: 'Every tool runs in WebAssembly inside your browser tab. Nothing is uploaded. Nothing is stored.',
                },
                {
                  icon: Zap,
                  title: 'No waiting',
                  desc: 'Processing starts the moment you drop a file. No queue, no upload progress bar — results in seconds.',
                },
                {
                  icon: Lock,
                  title: 'Free to use',
                  desc: `All ${TOOLS.length} tools are free. No account required. Just open the page and start editing.`,
                },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  transition={easeOut}
                  className="flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand-secondary/20 ring-1 ring-brand/20">
                    <Icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">{title}</h3>
                    <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
