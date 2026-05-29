'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BarChart2,
  Library,
  HardDrive,
  Download,
  Zap,
  Scissors,
  FileText,
  Wind,
  Package,
  SlidersHorizontal,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/auth.store'
import { libraryApi, usageApi } from '@/api'
import { formatBytes } from '@/lib/utils'
import { PLAN_LIMITS } from '@/types/user.types'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

const QUICK_TOOLS = [
  { slug: 'convert', name: 'Convert', icon: BarChart2 },
  { slug: 'trim', name: 'Trim', icon: Scissors },
  { slug: 'transcribe', name: 'Transcribe', icon: FileText },
  { slug: 'noise-remove', name: 'Denoise', icon: Wind },
  { slug: 'compress', name: 'Compress', icon: Package },
  { slug: 'normalize', name: 'Normalize', icon: SlidersHorizontal },
]

function buildWeeklyChart(files: import('@/types/api.types').LibraryFile[]) {
  const days: { day: string; ops: number }[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = d.toISOString().slice(0, 10)
    const ops = files.filter((f) => f.created_at.startsWith(dateStr)).length
    days.push({ day: label, ops })
  }
  return days
}

export default function DashboardPage() {
  const { user, profile } = useAuthStore()

  const { data: usageStats } = useQuery({
    queryKey: ['usage'],
    queryFn: usageApi.getStats,
    enabled: !!user,
  })

  const { data: libraryFiles = [] } = useQuery({
    queryKey: ['library'],
    queryFn: libraryApi.getFiles,
    enabled: !!user,
  })

  const plan = profile?.plan ?? 'free'
  const limits = PLAN_LIMITS[plan]
  const opsToday = usageStats?.today ?? profile?.operations_today ?? 0
  const opsLimit = limits.opsPerDay === Infinity ? null : limits.opsPerDay
  const storageUsed = usageStats?.storage_used_bytes ?? profile?.storage_used_bytes ?? 0
  const displayName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  const chartData = buildWeeklyChart(libraryFiles)
  const recentFiles = [...libraryFiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome header */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={easeOut}
        className="mb-8 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-brand/20 text-brand font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Welcome back, {displayName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  plan === 'pro'
                    ? 'border-brand/40 bg-brand/10 text-brand'
                    : 'border-bg-border text-text-muted'
                }
              >
                {plan === 'pro' ? 'Pro' : 'Free'}
              </Badge>
              {plan === 'free' && (
                <Link href="/pricing" className="text-xs text-brand hover:underline">
                  Upgrade to Pro →
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {/* Operations today */}
        <motion.div variants={fadeUp} transition={easeOut}>
          <Card className="bg-bg-surface border-bg-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <span className="text-sm text-text-muted">Operations today</span>
              <Zap className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text-primary">
                {opsToday}
                {opsLimit !== null && (
                  <span className="ml-1 text-sm font-normal text-text-muted">/ {opsLimit}</span>
                )}
              </p>
              {opsLimit !== null && (
                <Progress
                  value={(opsToday / opsLimit) * 100}
                  className="mt-2 h-1.5"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Files in library */}
        <motion.div variants={fadeUp} transition={easeOut}>
          <Card className="bg-bg-surface border-bg-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <span className="text-sm text-text-muted">Files saved</span>
              <Library className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text-primary">{libraryFiles.length}</p>
              <p className="mt-1 text-xs text-text-muted">
                {plan === 'free' ? 'Kept 1 day' : 'Kept 30 days'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Storage used */}
        <motion.div variants={fadeUp} transition={easeOut}>
          <Card className="bg-bg-surface border-bg-border">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <span className="text-sm text-text-muted">Storage used</span>
              <HardDrive className="h-4 w-4 text-brand" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-text-primary">{formatBytes(storageUsed)}</p>
              <p className="mt-1 text-xs text-text-muted">
                of {limits.maxFileSizeMb} MB limit per file
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick launch */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0.1 }}
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
              Quick Launch
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {QUICK_TOOLS.map(({ slug, name, icon: Icon }) => (
                <Link
                  key={slug}
                  href={`/tools/${slug}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-bg-border bg-bg-surface p-4 text-center transition-all hover:border-brand/40 hover:bg-bg-elevated hover:shadow-glow"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10">
                    <Icon className="h-4 w-4 text-brand" />
                  </div>
                  <span className="text-xs font-medium text-text-secondary">{name}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Activity chart */}
          <motion.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            transition={{ ...easeOut, delay: 0.15 }}
          >
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-muted">
              Operations this week
            </h2>
            <div className="rounded-xl border border-bg-border bg-bg-surface p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--bg-border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: 'hsl(var(--text-muted))', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--bg-elevated))',
                      border: '1px solid hsl(var(--bg-border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--text-primary))',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ops"
                    stroke="hsl(var(--brand-primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--brand-primary))', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Right column: recent activity */}
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ ...easeOut, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
              Recent activity
            </h2>
            <Link href="/library" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </div>

          <div className="rounded-xl border border-bg-border bg-bg-surface">
            {recentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Library className="h-8 w-8 text-text-muted" />
                <p className="text-sm text-text-muted">No activity yet</p>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/tools">Try a tool</Link>
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-bg-border">
                {recentFiles.map((file) => (
                  <li key={file.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {file.output_filename ?? file.input_filename}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          {file.tool}
                        </Badge>
                        <span className="text-xs text-text-muted">
                          {new Date(file.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {file.storage_path && (
                      <button
                        onClick={async () => {
                          const url = await libraryApi.getDownloadUrl(file.storage_path!)
                          window.open(url, '_blank')
                        }}
                        className="shrink-0 rounded p-1 text-text-muted hover:text-brand transition-colors"
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
