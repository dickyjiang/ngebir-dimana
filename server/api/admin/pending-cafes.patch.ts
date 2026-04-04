import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~~/types/database.types'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole<Database>(event)
  const body = await readBody(event)
  // body: { ids: number[], action: 'publish' | 'reject' }

  if (!body.ids?.length || !['publish', 'reject'].includes(body.action)) {
    throw createError({ statusCode: 400, message: 'Invalid payload' })
  }

  if (body.action === 'publish') {
    const { error } = await client
      .from('cafes')
      .update({ is_published: true })
      .in('id', body.ids)
    if (error) throw createError({ statusCode: 500, message: error.message })
  } else {
    const { error } = await client
      .from('cafes')
      .delete()
      .in('id', body.ids)
    if (error) throw createError({ statusCode: 500, message: error.message })
  }

  return { ok: true }
})
