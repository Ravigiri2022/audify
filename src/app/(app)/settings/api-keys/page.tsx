'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Key, Plus, Trash2, Copy, Check, Lock, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth.store'
import { apiKeysApi, usageApi } from '@/api'
import type { ApiKey } from '@/types/api.types'
import { fadeUp, stagger, easeOut } from '@/lib/motion'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audflo.app'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="rounded p-1 text-text-muted hover:text-brand transition-colors"
      title="Copy"
    >
      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

export default function ApiKeysPage() {
  const { user, profile } = useAuthStore()
  const queryClient = useQueryClient()

  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [revealKey, setRevealKey] = useState<{ key: string; id: string } | null>(null)
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null)

  const isPro = profile?.plan === 'pro'

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeysApi.list,
    enabled: !!user && isPro,
  })

  const { data: usageStats } = useQuery({
    queryKey: ['usage'],
    queryFn: usageApi.getStats,
    enabled: !!user && isPro,
  })

  const createMutation = useMutation({
    mutationFn: (name: string) => apiKeysApi.create(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setCreateOpen(false)
      setKeyName('')
      setRevealKey(data)
    },
    onError: () => toast.error('Failed to create API key'),
  })

  const revokeMutation = useMutation({
    mutationFn: apiKeysApi.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key revoked')
    },
    onError: () => toast.error('Failed to revoke key'),
  })

  if (!isPro) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={easeOut}
          className="flex flex-col items-center gap-6 rounded-2xl border border-bg-border bg-bg-surface p-10 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-brand/20">
            <Lock className="h-6 w-6 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">API access is a Pro feature</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Upgrade to Pro to generate API keys, automate audio processing, and integrate Audflo
              into your workflows.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/pricing">Upgrade to Pro</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={easeOut}
        className="mb-8 flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">API Keys</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Authenticate your requests with a secret API key.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create key
        </Button>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* API info */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="rounded-xl border border-bg-border bg-bg-surface p-5"
        >
          <h2 className="mb-3 text-sm font-semibold text-text-muted uppercase tracking-wider">
            API reference
          </h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-text-muted">Base URL</Label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2">
                <code className="flex-1 text-xs text-brand">{APP_URL}/api/v1</code>
                <CopyButton text={`${APP_URL}/api/v1`} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-text-muted">Authorization header</Label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-bg-border bg-bg-elevated px-3 py-2">
                <code className="flex-1 text-xs text-text-secondary">
                  Authorization: Bearer {'<your-api-key>'}
                </code>
                <CopyButton text="Authorization: Bearer <your-api-key>" />
              </div>
            </div>
          </div>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-brand hover:underline"
          >
            View API docs
            <ExternalLink className="h-3 w-3" />
          </a>
        </motion.div>

        {/* Usage stats */}
        {usageStats && (
          <motion.div
            variants={fadeUp}
            transition={easeOut}
            className="grid grid-cols-2 gap-4"
          >
            <div className="rounded-xl border border-bg-border bg-bg-surface p-4">
              <p className="text-xs text-text-muted">Requests today</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{usageStats.today}</p>
            </div>
            <div className="rounded-xl border border-bg-border bg-bg-surface p-4">
              <p className="text-xs text-text-muted">Requests this month</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{usageStats.month}</p>
            </div>
          </motion.div>
        )}

        {/* Keys table */}
        <motion.div
          variants={fadeUp}
          transition={easeOut}
          className="overflow-hidden rounded-xl border border-bg-border bg-bg-surface"
        >
          <div className="border-b border-bg-border bg-bg-elevated px-5 py-3">
            <h2 className="text-sm font-semibold text-text-primary">Your keys</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Key className="h-8 w-8 text-text-muted" />
              <div>
                <p className="font-medium text-text-primary">No API keys yet</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Create your first key to start using the API.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-bg-border">
              {apiKeys.map((key: ApiKey) => (
                <li key={key.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                    <Key className="h-4 w-4 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{key.name}</p>
                      <Badge
                        variant="outline"
                        className={
                          key.is_active
                            ? 'border-success/30 bg-success/10 text-success text-xs'
                            : 'border-error/30 bg-error/10 text-error text-xs'
                        }
                      >
                        {key.is_active ? 'Active' : 'Revoked'}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-text-muted">
                      <code>{key.key_prefix}••••••••</code>
                      <span>Created {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  {key.is_active && (
                    <button
                      onClick={() => setRevokeConfirm(key.id)}
                      className="shrink-0 rounded p-1.5 text-text-muted hover:bg-error/10 hover:text-error transition-colors"
                      aria-label="Revoke key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>

      {/* Create key dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-bg-surface border-bg-border max-w-sm">
          <DialogTitle className="text-text-primary">Create API key</DialogTitle>
          <div className="mt-2 space-y-4">
            <div>
              <Label htmlFor="key-name" className="text-sm text-text-secondary">
                Key name
              </Label>
              <Input
                id="key-name"
                placeholder="e.g. Production, My app"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="mt-1 bg-bg-elevated border-bg-border"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && keyName.trim()) {
                    createMutation.mutate(keyName.trim())
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!keyName.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate(keyName.trim())}
              >
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reveal new key dialog */}
      <Dialog open={!!revealKey} onOpenChange={() => setRevealKey(null)}>
        <DialogContent className="bg-bg-surface border-bg-border max-w-sm">
          <DialogTitle className="text-text-primary">Save your API key</DialogTitle>
          <p className="mt-1 text-sm text-text-secondary">
            This key will only be shown once. Copy it now and store it securely.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand/30 bg-brand/5 px-3 py-3">
            <code className="flex-1 break-all text-xs text-brand">{revealKey?.key}</code>
            <CopyButton text={revealKey?.key ?? ''} />
          </div>
          <Button className="mt-4 w-full" onClick={() => setRevealKey(null)}>
            I&apos;ve saved it
          </Button>
        </DialogContent>
      </Dialog>

      {/* Revoke confirm dialog */}
      <Dialog open={!!revokeConfirm} onOpenChange={() => setRevokeConfirm(null)}>
        <DialogContent className="bg-bg-surface border-bg-border max-w-sm">
          <DialogTitle className="text-text-primary">Revoke API key?</DialogTitle>
          <p className="text-sm text-text-secondary mt-1">
            Any applications using this key will immediately lose access. This action cannot be
            undone.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setRevokeConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (revokeConfirm) {
                  revokeMutation.mutate(revokeConfirm)
                  setRevokeConfirm(null)
                }
              }}
            >
              Revoke
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
