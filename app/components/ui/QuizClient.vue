<template>
  <UCard class="max-w-md bg-slate-800 text-white">
    <template #header>
      <h2 class="text-lg font-semibold">{{ question }}</h2>
      <p v-if="timeLimit" class="text-xs text-white/60">{{ countdown }}s kvar</p>
    </template>
    <div class="space-y-2">
      <button
        v-for="(choice, idx) in choices"
        :key="idx"
        type="button"
        class="w-full rounded border border-white/10 px-3 py-2 text-left transition hover:border-sky-400"
        :class="{ 'bg-sky-500/30 border-sky-500': selected.has(idx) }"
        @click="toggle(idx)"
      >
        {{ choice }}
      </button>
    </div>
    <template #footer>
      <div class="flex justify-between">
        <UButton color="gray" variant="ghost" @click="clear">Rensa</UButton>
        <UButton color="primary" @click="submit">Skicka</UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  question: string
  choices: string[]
  multi?: boolean
  timeLimit?: number
}>()

const emit = defineEmits<{
  (e: 'submit', value: number[]): void
}>()

const selected = ref<Set<number>>(new Set())
const remaining = ref(props.timeLimit ?? 0)
let timer: number | null = null

const toggle = (idx: number) => {
  if (!props.multi) {
    selected.value = new Set([idx])
    return
  }
  if (selected.value.has(idx)) {
    selected.value.delete(idx)
  } else {
    selected.value.add(idx)
  }
  selected.value = new Set(selected.value)
}

const clear = () => {
  selected.value = new Set()
}

const submit = () => {
  emit('submit', Array.from(selected.value))
  clear()
}

const countdown = computed(() => remaining.value)

onMounted(() => {
  if (props.timeLimit) {
    remaining.value = props.timeLimit
    timer = window.setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)
      if (remaining.value === 0 && timer) {
        window.clearInterval(timer)
        timer = null
        submit()
      }
    }, 1000)
  }
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})
</script>
