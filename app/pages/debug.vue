<template>
  <div class="space-y-6 bg-slate-950 p-6 text-white">
    <h1 class="text-2xl font-bold">Debug Timeline</h1>
    <div class="grid gap-4 lg:grid-cols-2">
      <PixelStage class="h-[360px]" />
      <div class="space-y-3">
        <UButton color="primary" @click="playDemo">Spela Demo</UButton>
        <UButton color="sky" variant="outline" @click="triggerPulse">PulseColor Macro</UButton>
        <QuizClient
          :question="quiz.question"
          :choices="quiz.choices"
          :time-limit="quiz.timeLimit"
          @submit="log('quiz', $event)"
        />
        <ScratchCard image="https://images.unsplash.com/photo-1604079628040-94301bb21b11?auto=format&fit=crop&w=400&q=60" @revealed="log('scratch', true)" />
        <BeatGame :bpm="beatGrid.bpm" :offsets="beatGrid.offsets" />
        <pre class="rounded bg-slate-900 p-3 text-xs">{{ logs.join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Debug-sidan ger verktyg för att testa timeline, makron och interaktiva moduler lokalt.
import { reactive, ref } from 'vue'
import PixelStage from '~/app/components/PixelStage.client.vue'
import QuizClient from '~/app/components/ui/QuizClient.vue'
import ScratchCard from '~/app/components/ui/ScratchCard.client.vue'
import BeatGame from '~/app/components/ui/BeatGame.client.vue'
import { useSequencer } from '~/app/composables/useSequencer'
import { useRenderer } from '~/app/composables/useRenderer'
import { useMacros } from '~/app/composables/useMacros'

const sequencer = useSequencer()
const renderer = useRenderer()
const macros = useMacros()
const logs = ref<string[]>([])
const quiz = reactive({ question: 'Vilken zon?', choices: ['Nord', 'Syd', 'Öst', 'Väst'], timeLimit: 10 })
const beatGrid = reactive({ bpm: 120, offsets: Array.from({ length: 8 }, (_, i) => i * (60_000 / 120)) })

const demoTimeline = {
  duration: 20000,
  tracks: {
    'bg.color': [
      { t: 0, v: '#000000' },
      { t: 1000, v: '#112244' }
    ],
    'sprite.logo.x': [
      { t: 0, v: -200, ease: 'outCubic' },
      { t: 1500, v: 0 }
    ],
    'sprite.logo.tint': [
      { t: 0, v: '#ffffff' },
      { t: 5000, v: '#ff0066' }
    ],
    'sprite.logo.rotation': [
      { t: 0, v: 0 },
      { t: 4000, v: 6.283 }
    ],
    'macro.pulseColor': [
      { t: 2000, v: { id: 'logo', from: '#ffffff', to: '#ff0066' } }
    ]
  }
}

const playDemo = async () => {
  await renderer.loadScene({
    textures: { logo: 'https://pixijs.com/assets/logo.png' },
    sprites: [{ id: 'logo', texture: 'logo' }]
  })
  sequencer.play(demoTimeline as any)
}

const triggerPulse = () => {
  macros.run('pulseColor', { id: 'logo', from: '#ffffff', to: '#33ffcc', duration: 800 })
}

const log = (type: string, payload: any) => {
  logs.value.unshift(`${type}: ${JSON.stringify(payload)}`)
}
</script>

