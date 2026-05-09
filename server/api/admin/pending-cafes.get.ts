import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  try {
    const client = serverSupabaseServiceRole<Database>(event)

    const { data, error } = await client
      .from('cafes')
      .select('id, name, city, rating, reviews, google_place_id, description, working_hours, source')
      .eq('is_published', false)
      .eq('source', 'auto-discovered')
      .order('id', { ascending: false })

    if (error) throw createError({ statusCode: 500, message: error.message })

    return data
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[pending-cafes] error:', msg)
    throw createError({ statusCode: 500, message: msg })
  }
})
