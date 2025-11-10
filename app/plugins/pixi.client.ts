import { Application, BatchRenderer, ExtensionType, extensions } from 'pixi.js'

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

export default defineNuxtPlugin(() => {
  if (!extensions.has(ExtensionType.WebGLRendererPlugin, BatchRenderer)) {
    extensions.add({
      type: ExtensionType.WebGLRendererPlugin,
      ref: BatchRenderer
    })
  }

  return {
    provide: {
      pixi: Application
    }
  }
})
