import type { Plan } from './user.types'

export interface LibraryFile {
  id: string
  user_id: string
  tool: string
  input_filename: string
  output_filename: string | null
  input_size_bytes: number | null
  output_size_bytes: number | null
  processing_ms: number | null
  status: 'completed' | 'failed'
  storage_path: string | null
  expires_at: string | null
  created_at: string
}

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  last_used_at: string | null
  is_active: boolean
  created_at: string
}

export interface UsageStats {
  today: number
  month: number
  plan: Plan
  limit: number
  storage_used_bytes: number
}

export interface SaveFilePayload {
  tool: string
  input_filename: string
  output_filename: string
  input_size_bytes: number
  output_size_bytes: number
  processing_ms: number
  storage_path?: string
}

export interface ApiResponse<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}
