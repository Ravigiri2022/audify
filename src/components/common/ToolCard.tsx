'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  Scissors,
  Package,
  Merge,
  SlidersHorizontal,
  VolumeX,
  Gauge,
  Music,
  Sunrise,
  Columns,
  Wind,
  FileText,
  Info,
  Activity,
  BarChart2,
  AudioLines,
  Mic,
  UserMinus,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fadeUp, easeOut } from '@/lib/motion'
import type { Tool } from '@/types/tool.types'

const ICON_MAP: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Scissors,
  Package,
  Merge,
  SlidersHorizontal,
  VolumeX,
  Gauge,
  Music,
  Sunrise,
  Columns,
  Wind,
  FileText,
  Info,
  Activity,
  BarChart2,
  AudioLines,
  Mic,
  UserMinus,
}

const CATEGORY_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'outline'> = {
  Convert: 'default',
  Edit: 'secondary',
  Enhance: 'success',
  Analyze: 'warning',
  Create: 'outline',
}

interface ToolCardProps {
  tool: Tool
  index: number
}

export function ToolCard({ tool, index }: ToolCardProps) {
  const IconComponent = ICON_MAP[tool.icon] ?? Info
  const badgeVariant = CATEGORY_BADGE_VARIANT[tool.category] ?? 'secondary'

  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ ...easeOut, delay: index * 0.05 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className="group flex flex-col gap-4 rounded-xl border border-bg-border bg-bg-surface p-5 transition-all duration-200 hover:bg-bg-elevated hover:border-brand/30 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand/20 to-brand-secondary/20 ring-1 ring-brand/20 group-hover:ring-brand/40 transition-all duration-200">
            <IconComponent
              size={18}
              className="text-brand group-hover:text-brand transition-colors"
            />
          </div>
          <Badge variant={badgeVariant} className="shrink-0">
            {tool.category}
          </Badge>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand transition-colors duration-150">
            {tool.name}
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-brand hover:text-brand hover:bg-brand/10 pointer-events-none"
          >
            <span>Try it &rarr;</span>
          </Button>
          {tool.proOnly && (
            <Badge variant="default" className="text-xs">Pro</Badge>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

export default ToolCard
