import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from('blogs')
    .select('id, title, slug, description, content, cover_image_url, category, published_at, created_at')
    .eq('is_published', false)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusMessage: error.message })
  return data ?? []
})
