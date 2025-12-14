import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-11-01',
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: false,
    shim: false
  },
  runtimeConfig: {
    public: {
      wsUrl: process.env.WS_URL || '',
      showId: process.env.SHOW_ID || 'demo'
    }
  },
  app: {
    head: {
      title: 'Arena Pixel Client',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' }
      ],
      link: [{ rel: 'manifest', href: '/manifest.webmanifest' }]
    }
  },
  nitro: {
    preset: 'node-server'
  },
  vite: {
    define: {
      __DEV__: process.env.NODE_ENV !== 'production'
    }
  }
})
