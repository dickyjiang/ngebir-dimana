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

  app: {
    head: {
      meta: [
        { name: 'google-site-verification', content: 'dNfSOEBSJtqhGJLTFUAwj0q1UOCtbaQ9bdqkUkxwPuU' }
      ]
    }
  },

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    cronSecret: process.env.CRON_SECRET || '',
  },

  // Site URL used by @nuxtjs/sitemap for absolute URLs
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://ngebir-dimana.com',
    name: 'Ngebir Dimana',
  },

  routeRules: {
    '/sitemap.xml': { prerender: false },
  },

  nitro: {
    prerender: {
      ignore: ['/sitemap.xml'],
    },
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    cacheMaxAgeSeconds: 0,
    runtimeCacheStorage: false,
    exclude: [
      '/login',
      '/dashboard',
      '/profile',
      '/bars/owner/**',
      '/bars/new',
      '/bars/feature/new',
      '/admin/**',
      '/confirm',
      '/Disclaimer',
      '/bars',
    ],
  },

  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || '',
    config: {
      send_page_view: true
    }
  },

  image: {
    domains: ['storage.di-mana.com'],
  },

  compatibilityDate: '2025-04-30',
  devtools: {
    enabled: true,
    vscode: {
      reuseExistingServer: true,
    },
  },
  sourcemap: {
    server: true,
    client: true
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      cookieRedirect: true,
      include: ['/account/*', '/account', '/cafe/owner/*', '/cafe/feature/new', '/cafes/new', '/admin/*'],
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
