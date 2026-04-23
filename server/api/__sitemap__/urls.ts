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

  const [cafeRes, blogRes, cityRes, featureRes] = await Promise.allSettled([
    fetchAll<{ slug_name: string }>(
      `${supabaseUrl}/rest/v1/cafes?select=slug_name&slug_name=not.is.null&is_published=eq.true`,
      serviceHeaders
    ),
    fetchAll<{ slug: string; published_at: string | null }>(
      `${supabaseUrl}/rest/v1/blogs?select=slug,published_at&is_published=eq.true`,
      anonHeaders
    ),
    fetchAll<{ city_slug: string }>(
      `${supabaseUrl}/rest/v1/city?select=city_slug`,
      anonHeaders
    ),
    fetchAll<{ feature_slug: string }>(
      `${supabaseUrl}/rest/v1/features?select=feature_slug&feature_slug=not.is.null`,
      anonHeaders
    ),
  ])

  const cafeData = cafeRes.status === 'fulfilled' ? cafeRes.value : []
  const blogData = blogRes.status === 'fulfilled' ? blogRes.value : []
  const cityData = cityRes.status === 'fulfilled' ? cityRes.value : []
  const featureData = featureRes.status === 'fulfilled' ? featureRes.value : []

  if (cafeRes.status === 'rejected') console.error('Sitemap cafe error:', cafeRes.reason)
  if (blogRes.status === 'rejected') console.error('Sitemap blog error:', blogRes.reason)
  if (cityRes.status === 'rejected') console.error('Sitemap city error:', cityRes.reason)
  if (featureRes.status === 'rejected') console.error('Sitemap feature error:', featureRes.reason)

  const staticUrls = [
    { loc: '/', changefreq: 'daily', priority: 1.0 },
    { loc: '/cafes', changefreq: 'weekly', priority: 0.8 },
    { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
    { loc: '/about-us', changefreq: 'monthly', priority: 0.5 },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: 0.3 },
    { loc: '/disclaimer', changefreq: 'monthly', priority: 0.3 },
  ]

  const cafeUrls = cafeData.map((cafe) => ({
    loc: `/cafe/${cafe.slug_name}`,
    changefreq: 'weekly',
    priority: 0.8,
  }))

  const blogUrls = blogData.map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: post.published_at ?? undefined,
  }))

  // Deduplicate city slugs (child cities may share slugs with parents)
  const uniqueCitySlugs = [...new Set(cityData.map((c) => c.city_slug))]
  const cityUrls = uniqueCitySlugs.map((slug) => ({
    loc: `/cafes?city=${slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }))

  const featureUrls = featureData.map((f) => ({
    loc: `/cafes?features=${f.feature_slug}`,
    changefreq: 'weekly',
    priority: 0.7,
  }))

  return [...staticUrls, ...cafeUrls, ...blogUrls, ...cityUrls, ...featureUrls]
})
