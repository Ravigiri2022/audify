import { client } from './client'
import type { ApiKey } from '@/types/api.types'

export const apiKeysApi = {
  list: async (): Promise<ApiKey[]> => {
    const { data } = await client.get<ApiKey[]>('/api-keys')
    return data
  },

  create: async (name: string): Promise<{ key: string; id: string }> => {
    const { data } = await client.post<{ key: string; id: string }>('/api-keys', { name })
    return data
  },

  revoke: async (id: string): Promise<void> => {
    await client.delete(`/api-keys/${id}`)
  },
}
