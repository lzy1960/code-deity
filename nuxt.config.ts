// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxtjs/supabase', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'zh-CN',
        name: '简体中文',
        file: 'zh-CN.json'
      }
    ],
    defaultLocale: 'zh-CN',
    strategy: 'no_prefix', // 不在URL中添加语言前缀
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected', // Cookie 名称
      redirectOn: 'root', // 仅在根路径重定向
    }
  },
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