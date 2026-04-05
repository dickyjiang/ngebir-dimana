// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/supabase',
    '@nuxtjs/leaflet',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
  ],

  // Site URL used by @nuxtjs/sitemap for absolute URLs
  site: {
    url: 'https://ngopi.di-mana.com',
  },

  routeRules: {
    // Prevent sitemap from being prerendered as a static file so the
    // Nitro plugin can inject blog URLs dynamically at request time
    '/sitemap.xml': { prerender: false },
  },

  sitemap: {
    // Static pages: Nuxt auto-discovers /about-us, /privacy-policy, /disclaimer, /cafes
    // Dynamic cafe and blog pages are injected via server/plugins/sitemap-blogs.ts
    sources: ['/api/__sitemap__/urls'],
    urls: [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/about-us', priority: 0.5, changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: 0.3, changefreq: 'monthly' },
      { loc: '/disclaimer', priority: 0.3, changefreq: 'monthly' },
    ],
    // Disable cache to prevent stale sitemaps persisting across deployments
    cacheMaxAgeSeconds: 0,
    runtimeCacheStorage: false,
    // Exclude auth/dashboard pages
    exclude: ['/login', '/dashboard', '/profile', '/cafe/owner/**', '/cafes/new'],
  },

  gtag: {
    id: 'G-BNWTEJPQY2',
    config: {
      send_page_view: true
    }
  },


  image: {
    domains: ['storage.di-mana.com'],
  },

  compatibilityDate: '2025-04-30',
  devtools: { enabled: true },
  sourcemap: {
    server: true,
    client: true
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      cookieRedirect: true,
      // exclude: ['/'],
      include: ['/account/*', '/account', '/cafe/owner/*'],
    }
  },
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost'
      },
      watch: {
        ignored: ['**/node_modules/**', '**/.git/**'],
      },
    }
  },
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },
  css: [
    '@fortawesome/fontawesome-free/css/all.css'
  ]
})