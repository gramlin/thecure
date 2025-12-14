import { Application } from 'pixi.js'

declare module '#app' {
  interface NuxtApp {
    $pixi: typeof Application
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $pixi: typeof Application
  }
}

/**
 * Registrerar PixiJS i Nuxt för användning i komponenter.
 * PixiJS 8.x har BatchRenderer inbyggd i renderaren.
 */
export default defineNuxtPlugin(() => {
  return {
    provide: {
      pixi: Application
    }
  }
})
