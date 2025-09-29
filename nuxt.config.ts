// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@nuxt/icon', '@nuxtjs/i18n'],
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
      ],
      script: [
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5722919995882918',
          crossorigin: 'anonymous',
          async: true,
        }
      ]
    },
  },


})
