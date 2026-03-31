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

  sitemap: {
    // Static pages: Nuxt auto-discovers /about-us, /privacy-policy, /disclaimer, /cafes
    // Dynamic cafe pages are served from the endpoint below
    sources: ['/__sitemap__/urls'],
    urls: [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/blog', priority: 0.8, changefreq: 'weekly' },
      { loc: '/about-us', priority: 0.5, changefreq: 'monthly' },
      { loc: '/privacy-policy', priority: 0.3, changefreq: 'monthly' },
      { loc: '/disclaimer', priority: 0.3, changefreq: 'monthly' },
    ],
    // Exclude auth/dashboard pages
    exclude: ['/login', '/dashboard', '/profile', '/cafe/owner/**', '/cafes/new'],
  },

  gtag: {
    id: 'G-BNWTEJPQY2',
    config: {
      send_page_view: true
    }
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