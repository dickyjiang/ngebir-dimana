// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   modules: ['nuxt-gtag'],

  gtag: {
    id: 'G-BNWTEJPQY2'
  },
  compatibilityDate: '2025-04-30',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/supabase',
    '@nuxtjs/leaflet',
    'nuxt-gtag'
  ],
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
      }
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