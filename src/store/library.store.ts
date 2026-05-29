'use client'
import { create } from 'zustand'
import type { LibraryFile } from '@/types/api.types'
import { libraryApi } from '@/api/library.api'

interface LibraryStore {
  files: LibraryFile[]
  isLoading: boolean
  fetchFiles: () => Promise<void>
  deleteFile: (id: string) => Promise<void>
  addFile: (file: LibraryFile) => void
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  files: [],
  isLoading: false,

  fetchFiles: async () => {
    set({ isLoading: true })
    try {
      const files = await libraryApi.getFiles()
      set({ files })
    } finally {
      set({ isLoading: false })
    }
  },

  deleteFile: async (id) => {
    await libraryApi.deleteFile(id)
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
    }))
  },

  addFile: (file) =>
    set((state) => ({
      files: [file, ...state.files],
    })),
}))
