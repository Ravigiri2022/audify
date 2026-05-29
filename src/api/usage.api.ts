import { client } from './client'
import type { UsageStats } from '@/types/api.types'

interface LogOperationPayload {
  tool: string
  input_size_bytes: number
  output_size_bytes: number
  processing_ms: number
  status: 'completed' | 'failed'
}

export const usageApi = {
  getStats: async (): Promise<UsageStats> => {
    const { data } = await client.get<UsageStats>('/usage')
    return data
  },

  logOperation: async (op: LogOperationPayload): Promise<void> => {
    await client.post('/usage/log', op)
  },
}
