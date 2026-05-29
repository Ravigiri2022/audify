import { NextRequest } from 'next/server'
import { validateApiKey, isErrorResponse } from '../_lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import type { LibraryFile } from '@/types/api.types'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export async function GET(request: NextRequest) {
  // 1. Validate API key
  const ctx = await validateApiKey(request)
  if (isErrorResponse(ctx)) return ctx

  // 2. Parse query params
  const { searchParams } = new URL(request.url)

  const pageRaw = searchParams.get('page')
  const limitRaw = searchParams.get('limit')
  const tool = searchParams.get('tool')?.trim() || null

  const page = pageRaw !== null ? Number(pageRaw) : DEFAULT_PAGE
  const limit = limitRaw !== null ? Number(limitRaw) : DEFAULT_LIMIT

  if (!Number.isInteger(page) || page < 1) {
    return Response.json({ error: 'Query param "page" must be a positive integer' }, { status: 400 })
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return Response.json(
      { error: `Query param "limit" must be an integer between 1 and ${MAX_LIMIT}` },
      { status: 400 }
    )
  }

  const offset = (page - 1) * limit

  const supabase = createServiceClient()

  // 3. Build query
  let countQuery = supabase
    .from('operations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', ctx.userId)

  let dataQuery = supabase
    .from('operations')
    .select('*')
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (tool) {
    countQuery = countQuery.eq('tool', tool)
    dataQuery = dataQuery.eq('tool', tool)
  }

  // 4. Execute both queries in parallel
  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  if (countResult.error) {
    return Response.json({ error: countResult.error.message }, { status: 500 })
  }

  if (dataResult.error) {
    return Response.json({ error: dataResult.error.message }, { status: 500 })
  }

  const total = countResult.count ?? 0

  // 5. Return paginated response
  return Response.json({
    data: dataResult.data as LibraryFile[],
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  })
}
