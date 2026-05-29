import { client } from './client'
import type { LibraryFile, SaveFilePayload } from '@/types/api.types'

export const libraryApi = {
  getFiles: async (): Promise<LibraryFile[]> => {
    const { data } = await client.get<LibraryFile[]>('/library')
    return data
  },

  deleteFile: async (id: string): Promise<void> => {
    await client.delete(`/library/${id}`)
  },

  saveFile: async (payload: SaveFilePayload): Promise<LibraryFile> => {
    const { data } = await client.post<LibraryFile>('/library', payload)
    return data
  },

  getDownloadUrl: async (storagePath: string): Promise<string> => {
    const { data } = await client.get<{ url: string }>('/library/download-url', {
      params: { path: storagePath },
    })
    return data.url
  },
}
