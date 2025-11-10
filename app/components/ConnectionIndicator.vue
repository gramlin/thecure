<template>
  <div class="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-2 text-xs text-white">
    <span :class="['h-2 w-2 rounded-full', colorClass]"></span>
    <span class="font-medium capitalize">{{ statusLabel }}</span>
    <span v-if="stats" class="text-white/60">rtt {{ Math.round(stats.rtt) }}ms</span>
  </div>
</template>

<script setup lang="ts">

// ConnectionIndicator visualiserar anslutningsstatus och enkel RTT-statistik.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useWs } from '~/app/plugins/ws.client'
import { useAppState } from '~/app/stores/appState'

const ws = useWs()
const store = useAppState()
const status = ref<'connected' | 'connecting' | 'disconnected' | 'mock'>(store.connectionStatus)
const stats = ref<{ rtt: number; offset: number } | null>(null)
let stop: (() => void) | null = null
let interval: number | null = null

const updateStats = () => {
  stats.value = ws.getStats()
}

onMounted(() => {
  stop = ws.on('status', (event: any) => {
    status.value = event.status
    store.setConnection(event.status)
  })
  interval = window.setInterval(updateStats, 2000)
  updateStats()
})

onUnmounted(() => {
  stop?.()
  if (interval) window.clearInterval(interval)
})

const statusLabel = computed(() => status.value)

const colorClass = computed(() => {
  switch (status.value) {
    case 'connected':
      return 'bg-emerald-400'
    case 'mock':
      return 'bg-slate-400'
    case 'connecting':
      return 'bg-amber-400'
    default:
      return 'bg-rose-400'
  }
})
</script>

