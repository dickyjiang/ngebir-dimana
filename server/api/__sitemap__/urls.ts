/**
 * Dynamic sitemap URL source for @nuxtjs/sitemap.
 * Called by the sitemap module to get all cafe and blog page URLs.
 * Cafe pages: weekly changefreq, priority 0.8.
 * Blog posts: weekly changefreq, priority 0.6.
 *
 * Uses direct Supabase REST API calls with the anon key instead of
 * serverSupabaseClient, so it works reliably in all contexts including
 * prerender (where the event object is synthetic and client helpers may fail).
 * Both tables have public SELECT RLS policies for their visible rows.
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabase.url as string
  const supabaseKey = config.public.supabase.key as string

  const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
  }

  const [cafeRes, blogRes] = await Promise.allSettled([
    $fetch<{ slug_name: string; updated_at: string | null }[]>(
      `${supabaseUrl}/rest/v1/cafes?select=slug_name,updated_at&slug_name=not.is.null`,
      { headers }
    ),
    $fetch<{ slug: string; published_at: string | null }[]>(
      `${supabaseUrl}/rest/v1/blogs?select=slug,published_at&is_published=eq.true`,
      { headers }
    ),
  ])

  const cafeData = cafeRes.status === 'fulfilled' ? cafeRes.value : []
  const blogData = blogRes.status === 'fulfilled' ? blogRes.value : []

  if (cafeRes.status === 'rejected') {
    console.error('Sitemap cafe URL generation error:', cafeRes.reason)
  }
  if (blogRes.status === 'rejected') {
    console.error('Sitemap blog URL generation error:', blogRes.reason)
  }

  const staticUrls = [
    { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
    { loc: '/about-us', changefreq: 'monthly', priority: 0.5 },
    { loc: '/privacy-policy', changefreq: 'monthly', priority: 0.3 },
    { loc: '/disclaimer', changefreq: 'monthly', priority: 0.3 },
  ]

  const cafeUrls = cafeData.map((cafe) => ({
    loc: `/cafe/${cafe.slug_name}`,
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: cafe.updated_at ?? undefined,
  }))

  const blogUrls = blogData.map((post) => ({
    loc: `/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: 0.6,
    lastmod: post.published_at ?? undefined,
  }))

  return [...staticUrls, ...cafeUrls, ...blogUrls]
})
