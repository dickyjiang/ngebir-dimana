/**
 * Nitro plugin that hooks into @nuxtjs/sitemap's sitemap:sources event
 * to inject blog URLs directly — no HTTP roundtrip, works in all contexts
 * (SSR request-time, prerender, Cloudflare Workers).
 */
export default defineNitroPlugin((nitroApp) => {
  // @ts-expect-error — sitemap:sources is added by @nuxtjs/sitemap at runtime
  nitroApp.hooks.hook('sitemap:sources', async (ctx: { sources: unknown[] }) => {
    try {
      const config = useRuntimeConfig()
      const supabaseUrl = config.public.supabase.url as string
      const supabaseKey = config.public.supabase.key as string

      const blogs = await $fetch<{ slug: string; published_at: string | null }[]>(
        `${supabaseUrl}/rest/v1/blogs?select=slug,published_at&is_published=eq.true`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      )

      ctx.sources.push({
        context: { name: 'blog-posts', description: 'Published blog posts from Supabase' },
        urls: [
          { loc: '/blog', changefreq: 'weekly', priority: 0.7 },
          ...blogs.map((b) => ({
            loc: `/blog/${b.slug}`,
            changefreq: 'weekly',
            priority: 0.6,
            lastmod: b.published_at ?? undefined,
          })),
        ],
      })
    } catch (err) {
      console.error('[sitemap-blogs] Failed to inject blog URLs:', err)
    }
  })
})
