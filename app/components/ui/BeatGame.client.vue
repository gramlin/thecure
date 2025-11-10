<template>
  <div class="rounded-xl bg-slate-800 p-4 text-white">
    <h3 class="mb-2 text-lg font-semibold">Beat Game</h3>
    <div class="mb-4 flex items-center justify-between text-sm text-white/60">
      <span>Score: {{ score }}</span>
      <span>Combo: {{ combo }}</span>
    </div>
    <div class="relative mb-4 h-24 overflow-hidden rounded bg-slate-900">
      <div
        v-for="(beat, idx) in timeline"
        :key="idx"
        class="absolute top-0 h-full w-1 bg-sky-400"
        :style="{ left: `${Math.min(100, (beat.time / duration) * 100)}%`, opacity: beat.hit ? 0.2 : 1 }"
      ></div>
    </div>
    <UButton size="xl" block color="primary" @click="tap">Tap</UButton>
    <p class="mt-3 text-xs text-white/60">Tryck i takt med pulsen!</p>
  </div>
</template>

<script setup lang="ts">
// BeatGame låter användaren trycka i takt med beat-grid och rapporterar score via GameBus.
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { useClock } from '~/app/composables/useClock'
import { useGameBus } from '~/app/composables/useGameBus'

const props = defineProps<{
  bpm: number
  offsets: number[]
}>()

const clock = useClock()
const bus = useGameBus()
const start = clock.now()
const beatInterval = 60000 / props.bpm
const duration = beatInterval * props.offsets.length
const timeline = reactive(props.offsets.map((offset) => ({ time: offset, hit: false })))
const score = ref(0)
const combo = ref(0)
let raf: number | null = null

const tap = () => {
  const t = clock.now() - start
  let bestIdx = -1
  let bestDiff = Infinity
  timeline.forEach((beat, idx) => {
    if (beat.hit) return
    const diff = Math.abs(beat.time - t)
    if (diff < bestDiff) {
      bestDiff = diff
      bestIdx = idx
    }
  })
  let gained = 0
  if (bestIdx !== -1) {
    if (bestDiff < 100) {
      gained = 300
      combo.value += 1
    } else if (bestDiff < 200) {
      gained = 150
      combo.value = 0
    } else {
      combo.value = 0
    }
    if (bestDiff < 200) {
      timeline[bestIdx].hit = true
    }
  }
  if (gained > 0) {
    score.value += gained
    bus.emit({ type: 'score', payload: gained })
  }
}

const loop = () => {
  const t = clock.now() - start
  timeline.forEach((beat) => {
    if (!beat.hit && t - beat.time > 250) {
      beat.hit = true
      combo.value = 0
    }
  })
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  raf = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
})
</script>

