// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxtjs/supabase'],
  app: {
    head: {
      meta: [
        {
          name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        }
      ]
    }
  },

  supabase: {
    // These environment variables are automatically read from .env file
    // url: process.env.SUPABASE_URL,
    // key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/settings',
      callback: '/confirm', // Supabase will redirect here after login
      exclude: ['/'], // Allow visiting the main page without being logged in
    }
  }
})
