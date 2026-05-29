'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AudioLines } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import ToolCard from '@/components/common/ToolCard'
import { TOOLS, TOOL_CATEGORIES } from '@/lib/constants'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

const ALL_CATEGORIES = ['All', ...TOOL_CATEGORIES] as const
type CategoryFilter = (typeof ALL_CATEGORIES)[number]

export default function ToolsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All')

  const filteredTools = useMemo(() => {
    const q = search.toLowerCase().trim()
    return TOOLS.filter((tool) => {
      const matchesCategory =
        activeCategory === 'All' || tool.category === activeCategory
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [search, activeCategory])

  return (
    <div className="min-h-screen bg-bg-base">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={easeOut}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-text-primary">All Audio Tools</h1>
          <p className="mt-2 text-text-secondary">
            19 browser-based tools — no uploads, no servers, 100% private.
          </p>
        </motion.div>

        {/* Controls row */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...easeOut, delay: 0.08 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search tools…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-bg-surface border-bg-border focus:border-brand"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-all duration-150 ${
                  activeCategory === cat
                    ? 'bg-brand text-white shadow-glow'
                    : 'bg-bg-elevated text-text-secondary hover:bg-bg-border hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filteredTools.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${search}`}
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
          ) : (
            <motion.div
              key="empty"
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={easeOut}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-bg-border bg-bg-surface py-24 text-center"
            >
              <AudioLines className="h-10 w-10 text-text-muted" />
              <div>
                <p className="text-lg font-semibold text-text-primary">No tools found</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Try a different search term or category.
                </p>
              </div>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All') }}
                className="text-sm text-brand hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  )
}
