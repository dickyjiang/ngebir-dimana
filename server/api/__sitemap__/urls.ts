/**
 * Dynamic sitemap URL source for @nuxtjs/sitemap.
 * Called by the sitemap module at /__sitemap__/urls to get all cafe and blog page URLs.
 * Cafe pages: weekly changefreq, priority 0.8.
 * Blog posts: monthly changefreq, priority 0.6.
 */
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Fetch all cafe slugs
  const { data: cafeData, error: cafeError } = await client
    .from('cafes')
    .select('slug_name, updated_at')
    .not('slug_name', 'is', null)

  if (cafeError) {
    console.error('Sitemap cafe URL generation error:', cafeError.message)
  }

  // Fetch all published blog slugs
  const { data: blogData, error: blogError } = await client
    .from('blogs')
    .select('slug, published_at')
    .eq('is_published', true)

  if (blogError) {
    console.error('Sitemap blog URL generation error:', blogError.message)
  }

  const cafeUrls = (cafeData || []).map((cafe) => ({
    loc: `/cafe/${cafe.slug_name}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: cafe.updated_at ?? undefined,
  }))

  const blogUrls = (blogData || []).map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: 'monthly',
    priority: 0.6,
    lastmod: post.published_at ?? undefined,
  }))

  return [...cafeUrls, ...blogUrls]
})
