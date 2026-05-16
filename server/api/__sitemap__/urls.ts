/**
 * Dynamic sitemap URL source for @nuxtjs/sitemap.
 * Generates URLs for all public pages: static pages, cafes, blogs, cities, and features.
 *
 * Uses direct Supabase REST API calls instead of serverSupabaseClient,
 * so it works reliably in all contexts including prerender.
 */
/**
 * Fetches all rows from a Supabase REST endpoint, paginating in chunks
 * of 1000 to bypass PostgREST's default row limit.
 */
async function fetchAll<T>(url: string, headers: Record<string, string>): Promise<T[]> {
  const pageSize = 1000
  const results: T[] = []
  let offset = 0

  while (true) {
    const separator = url.includes('?') ? '&' : '?'
    const page = await $fetch<T[]>(`${url}${separator}limit=${pageSize}&offset=${offset}`, { headers })
    results.push(...page)
    if (page.length < pageSize) break
    offset += pageSize
  }

  return results
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabase.url as string
  const anonKey = config.public.supabase.key as string
  const serviceKey = (config.supabaseServiceKey as string) || anonKey

  const serviceHeaders = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  }
  const anonHeaders = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  }

  const [cafeRes, blogRes] = await Promise.allSettled([
    fetchAll<{ slug_name: string; updated_at: string | null; created_at: string | null }>(
      `${supabaseUrl}/rest/v1/cafes?select=slug_name,updated_at,created_at&slug_name=not.is.null&is_published=eq.true`,
      serviceHeaders
    ),
    fetchAll<{ slug: string; published_at: string | null; updated_at: string | null }>(
      `${supabaseUrl}/rest/v1/blogs?select=slug,published_at,updated_at&is_published=eq.true`,
      anonHeaders
    ),
  ])

  const cafeData = cafeRes.status === 'fulfilled' ? cafeRes.value : []
  const blogData = blogRes.status === 'fulfilled' ? blogRes.value : []

  if (cafeRes.status === 'rejected') console.error('Sitemap cafe error:', cafeRes.reason)
  if (blogRes.status === 'rejected') console.error('Sitemap blog error:', blogRes.reason)

  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/bars', changefreq: 'weekly', priority: 0.8 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
    { loc: '/about-us', changefreq: 'monthly', priority: 0.5 },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: 0.3 },
    { loc: '/disclaimer', changefreq: 'monthly', priority: 0.3 },
  ]

  const cafeUrls = cafeData.map((cafe) => ({
    loc: `/bars/${cafe.slug_name}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: cafe.updated_at || cafe.created_at || new Date().toISOString(),
  }))

  const blogUrls = blogData.map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: post.updated_at || post.published_at || new Date().toISOString(),
  }))

  return [...staticUrls, ...cafeUrls, ...blogUrls]
})
