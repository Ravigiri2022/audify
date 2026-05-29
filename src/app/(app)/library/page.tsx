'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table'
import { motion } from 'framer-motion'
import { Library, Trash2, Download, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/store/auth.store'
import { libraryApi } from '@/api'
import { formatBytes } from '@/lib/utils'
import type { LibraryFile } from '@/types/api.types'
import { fadeUp, easeOut } from '@/lib/motion'
import { TOOLS } from '@/lib/constants'

const columnHelper = createColumnHelper<LibraryFile>()

const TOOL_OPTIONS = ['All', ...Array.from(new Set(TOOLS.map((t) => t.slug)))]

export default function LibraryPage() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const [globalFilter, setGlobalFilter] = useState('')
  const [toolFilter, setToolFilter] = useState('All')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: libraryApi.getFiles,
    enabled: !!user,
  })

  const deleteMutation = useMutation({
    mutationFn: libraryApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] })
      toast.success('File deleted')
    },
    onError: () => toast.error('Failed to delete file'),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => libraryApi.deleteFile(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] })
      setRowSelection({})
      toast.success('Files deleted')
    },
    onError: () => toast.error('Failed to delete files'),
  })

  const filteredData = useMemo(() => {
    return files.filter((f) => toolFilter === 'All' || f.tool === toolFilter)
  }, [files, toolFilter])

  const columns = useMemo<ColumnDef<LibraryFile, unknown>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="h-4 w-4 rounded border-bg-border accent-brand"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="h-4 w-4 rounded border-bg-border accent-brand"
          />
        ),
        size: 40,
      },
      columnHelper.accessor('output_filename', {
        header: 'Filename',
        cell: (info) => (
          <span className="truncate max-w-[200px] block text-sm font-medium text-text-primary">
            {info.getValue() ?? info.row.original.input_filename}
          </span>
        ),
      }),
      columnHelper.accessor('tool', {
        header: 'Tool',
        cell: (info) => (
          <Badge variant="secondary" className="text-xs">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor('input_size_bytes', {
        header: 'Input',
        cell: (info) => (
          <span className="text-sm text-text-secondary">
            {info.getValue() ? formatBytes(info.getValue()!) : '—'}
          </span>
        ),
      }),
      columnHelper.accessor('output_size_bytes', {
        header: 'Output',
        cell: (info) => (
          <span className="text-sm text-text-secondary">
            {info.getValue() ? formatBytes(info.getValue()!) : '—'}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Processed',
        cell: (info) => (
          <span className="text-sm text-text-secondary">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.accessor('expires_at', {
        header: 'Expires',
        cell: (info) => (
          <span className="text-sm text-text-muted">
            {info.getValue()
              ? new Date(info.getValue()!).toLocaleDateString()
              : '—'}
          </span>
        ),
      }),
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            {row.original.storage_path && (
              <button
                onClick={async () => {
                  try {
                    const url = await libraryApi.getDownloadUrl(row.original.storage_path!)
                    window.open(url, '_blank')
                  } catch {
                    toast.error('Download failed')
                  }
                }}
                className="rounded p-1.5 text-text-muted hover:bg-bg-elevated hover:text-brand transition-colors"
                aria-label="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setDeleteConfirm(row.original.id)}
              className="rounded p-1.5 text-text-muted hover:bg-error/10 hover:text-error transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ] as ColumnDef<LibraryFile, any>[],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, rowSelection },
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  })

  const selectedIds = Object.keys(rowSelection)
    .filter((k) => rowSelection[k])
    .map((k) => filteredData[parseInt(k)]?.id)
    .filter(Boolean) as string[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={easeOut}
        className="mb-6 flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-text-primary">File Library</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {files.length} processed file{files.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Controls */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ ...easeOut, delay: 0.05 }}
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative max-w-xs w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search files…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-bg-surface border-bg-border"
          />
        </div>

        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-40 bg-bg-surface border-bg-border">
            <SelectValue placeholder="Filter by tool" />
          </SelectTrigger>
          <SelectContent>
            {TOOL_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete {selectedIds.length} selected
          </Button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        variants={fadeUp}
        initial="initial"
        animate="animate"
        transition={{ ...easeOut, delay: 0.1 }}
        className="overflow-hidden rounded-xl border border-bg-border bg-bg-surface"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Library className="h-10 w-10 text-text-muted" />
            <div>
              <p className="font-semibold text-text-primary">No files yet</p>
              <p className="mt-1 text-sm text-text-secondary">
                Processed files will appear here after you use a tool.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b border-bg-border bg-bg-elevated">
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-bg-border last:border-0 hover:bg-bg-elevated transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-bg-border px-4 py-3">
              <p className="text-sm text-text-muted">
                {table.getFilteredRowModel().rows.length} total rows
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Single delete confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-bg-surface border-bg-border max-w-sm">
          <DialogTitle className="text-text-primary">Delete file?</DialogTitle>
          <p className="text-sm text-text-secondary">This will permanently remove the record. This action cannot be undone.</p>
          <div className="mt-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) {
                  deleteMutation.mutate(deleteConfirm)
                  setDeleteConfirm(null)
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirm */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="bg-bg-surface border-bg-border max-w-sm">
          <DialogTitle className="text-text-primary">
            Delete {selectedIds.length} files?
          </DialogTitle>
          <p className="text-sm text-text-secondary">This action cannot be undone.</p>
          <div className="mt-4 flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                bulkDeleteMutation.mutate(selectedIds)
                setBulkDeleteOpen(false)
              }}
            >
              Delete all
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
