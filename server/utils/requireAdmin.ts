import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = serverSupabaseServiceRole(event)
  const { data } = await client
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!data?.is_admin) throw createError({ statusCode: 403, message: 'Forbidden' })
}
