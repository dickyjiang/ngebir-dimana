import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event)

  const { data, error } = await client
    .from('cafes')
    .select('id, name, city, rating, reviews, google_place_id, description, working_hours, source, created_at')
    .eq('is_published', false)
    .eq('source', 'auto-discovered')
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})
