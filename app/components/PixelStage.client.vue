<template>
  <div class="relative h-full w-full overflow-hidden" :style="{ background: backgroundColor }">
    <canvas ref="canvasRef" class="h-full w-full" />
    <div v-if="!webgl" class="pointer-events-none absolute inset-0 flex items-center justify-center">
      <p class="text-center text-sm text-white/70">Canvas fallback aktiv.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// PixelStage monterar renderern på en canvas och visar fallback när WebGL saknas.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRenderer } from '~/app/composables/useRenderer'
import { storeToRefs } from 'pinia'
import { useAppState } from '~/app/stores/appState'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const renderer = useRenderer()
const store = useAppState()
const { backgroundColor } = storeToRefs(store)
const webgl = ref(true)
let resizeHandler: (() => void) | null = null

const syncSize = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return
  const { width, height } = canvas.getBoundingClientRect()
  canvas.width = width
  canvas.height = height
}

onMounted(async () => {
  if (!canvasRef.value) return
  syncSize(canvasRef.value)
  await renderer.mount(canvasRef.value)
  webgl.value = renderer.webgl
  resizeHandler = () => syncSize(canvasRef.value)
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  if (resizeHandler) window.removeEventListener('resize', resizeHandler)
})
</script>

