<template>
  <div class="relative h-48 w-80 select-none overflow-hidden rounded-lg bg-slate-700">
    <img :src="image" alt="scratch" class="h-full w-full object-cover" />
    <canvas ref="canvas" class="absolute inset-0 h-full w-full" />
  </div>
</template>

<script setup lang="ts">
// ScratchCard renderar en skrapbar overlay och signalerar när tillräckligt mycket har avslöjats.
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    image: string
    threshold?: number
  }>(),
  {
    threshold: 0.7
  }
)

const emit = defineEmits<{ (e: 'revealed'): void }>()

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false
let revealed = false

const draw = (x: number, y: number) => {
  if (!ctx) return
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(x, y, 20, 0, Math.PI * 2)
  ctx.fill()
  checkReveal()
}

const checkReveal = () => {
  if (!canvas.value || !ctx || revealed) return
  const { width, height } = canvas.value
  const pixels = ctx.getImageData(0, 0, width, height).data
  let transparent = 0
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) transparent++
  }
  const ratio = transparent / (width * height)
  if (ratio > props.threshold) {
    revealed = true
    emit('revealed')
  }
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')
  if (!ctx) return
  const { width, height } = canvas.value
  ctx.fillStyle = '#b4b8c2'
  ctx.fillRect(0, 0, width, height)

  const getPos = (event: PointerEvent) => {
    const rect = canvas.value!.getBoundingClientRect()
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }

  canvas.value.addEventListener('pointerdown', (event) => {
    drawing = true
    const { x, y } = getPos(event)
    draw(x, y)
  })
  canvas.value.addEventListener('pointermove', (event) => {
    if (!drawing) return
    event.preventDefault()
    const { x, y } = getPos(event)
    draw(x, y)
  })
  window.addEventListener('pointerup', () => {
    drawing = false
  })
})
</script>
