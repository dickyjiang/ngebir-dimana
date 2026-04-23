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

  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
  },

  // Site URL used by @nuxtjs/sitemap for absolute URLs
  site: {
    url: 'https://ngopi.di-mana.com',
  },

  routeRules: {
    '/sitemap.xml': { prerender: false },
  },

  nitro: {
    prerender: {
      // Force sitemap out of prerender — routeRules alone doesn't override
      // @nuxtjs/sitemap's internal addPrerenderRoutes('/sitemap.xml') call.
      // Without this, Cloudflare Pages serves the stale static file forever.
      ignore: ['/sitemap.xml'],
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    cacheMaxAgeSeconds: 0,
    runtimeCacheStorage: false,
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