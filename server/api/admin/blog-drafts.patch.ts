import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const client = serverSupabaseServiceRole(event)
  const body = await readBody<{ ids: number[]; action: 'publish' | 'delete' }>(event)

  if (!body?.ids?.length || !body.action) {
    throw createError({ statusCode: 400, statusMessage: 'Missing ids or action' })
  }

  if (body.action === 'publish') {
    const { error } = await client
      .from('blogs')
      .update({ is_published: true, published_at: new Date().toISOString().split('T')[0] })
      .in('id', body.ids)
    if (error) throw createError({ statusMessage: error.message })
  } else if (body.action === 'delete') {
    const { error } = await client.from('blogs').delete().in('id', body.ids)
    if (error) throw createError({ statusMessage: error.message })
  }

  return { ok: true }
})
