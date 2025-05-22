// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
   modules: ['@nuxtjs/gtm'],
      gtm: {
        id: 'GTM-5KS68GXM', // Replace with your GTM container ID
        enableRouterSync: true // Optional: Enable router sync
      },
  compatibilityDate: '2025-04-30',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/supabase',
    '@nuxtjs/leaflet'
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