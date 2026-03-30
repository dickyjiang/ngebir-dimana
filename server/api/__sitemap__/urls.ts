/**
 * Dynamic sitemap URL source for @nuxtjs/sitemap.
 * Called by the sitemap module at /__sitemap__/urls to get all cafe page URLs.
 * Returns one entry per published cafe with weekly changefreq and priority 0.8.
 */
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('cafes')
    .select('slug_name, updated_at')
    .not('slug_name', 'is', null)

  if (error) {
    console.error('Sitemap URL generation error:', error.message)
    return []
  }

  return (data || []).map((cafe) => ({
    loc: `/cafe/${cafe.slug_name}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: cafe.updated_at ?? undefined,
  }))
})
