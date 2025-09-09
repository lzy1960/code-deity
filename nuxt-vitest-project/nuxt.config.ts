// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxt/test-utils', '@nuxtjs/tailwindcss'],
  typescript: {
    typeCheck: true
  },
  ssr: false,
})
