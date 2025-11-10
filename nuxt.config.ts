import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  modules: ['@nuxt/ui', '@pinia/nuxt'],
  typescript: {
    strict: true,
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
