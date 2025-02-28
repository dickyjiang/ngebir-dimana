// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@nuxt/image', '@nuxtjs/gtm'],
  gtm: {
    id: 'G-BNWTEJPQY2', // Your GTM ID
    enabled: true, // Enable in all environments
    debug: false, // Enable debug mode
  }
})