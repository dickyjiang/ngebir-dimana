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
  const serviceKey = (config.supabaseServiceKey as string) || (config.supabaseServiceRoleKey as string) || anonKey

  // DEBUG: log env var resolution
  console.log('[Sitemap DEBUG] supabaseUrl:', supabaseUrl)
  console.log('[Sitemap DEBUG] serviceKey length:', serviceKey?.length ?? 0)
  console.log('[Sitemap DEBUG] anonKey length:', anonKey?.length ?? 0)
  console.log('[Sitemap DEBUG] serviceKey source:', config.supabaseServiceKey ? 'SUPABASE_SERVICE_KEY' : config.supabaseServiceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : 'anon fallback')

  const serviceHeaders = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
  }
  const anonHeaders = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  }

  const cafeQueryUrl = `${supabaseUrl}/rest/v1/cafes?select=slug_name&slug_name=not.is.null&is_published=eq.true`
  console.log('[Sitemap DEBUG] cafe fetch URL:', cafeQueryUrl)

  // Fetch cafes with detailed logging
  let cafeData: { slug_name: string }[] = []
  try {
    const res = await globalThis.fetch(`${cafeQueryUrl}&limit=1000&offset=0`, {
      headers: serviceHeaders,
    })
    console.log('[Sitemap DEBUG] cafe response status:', res.status)
    const body = await res.text()
    console.log('[Sitemap DEBUG] cafe response body (first 500 chars):', body.substring(0, 500))
    if (res.ok) {
      cafeData = JSON.parse(body)
    } else {
      console.error('[Sitemap DEBUG] cafe fetch failed with status', res.status)
    }
  } catch (err) {
    console.error('[Sitemap DEBUG] cafe fetch error:', err)
  }
  console.log('[Sitemap DEBUG] cafe results count:', cafeData.length)

  const [blogRes] = await Promise.allSettled([
    fetchAll<{ slug: string; published_at: string | null }>(
      `${supabaseUrl}/rest/v1/blogs?select=slug,published_at&is_published=eq.true`,
      anonHeaders
    ),
  ])

  const blogData = blogRes.status === 'fulfilled' ? blogRes.value : []

  if (blogRes.status === 'rejected') console.error('Sitemap blog error:', blogRes.reason)
  if (cafeData.length === 0) console.warn('Sitemap: no published cafes returned from Supabase')
  if (blogData.length === 0) console.warn('Sitemap: no published blogs returned from Supabase')

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
  }))

  const blogUrls = blogData.map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: post.published_at || new Date().toISOString(),
  }))

  return [...staticUrls, ...cafeUrls, ...blogUrls]
})
