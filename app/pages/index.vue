<template>
  <div class="flex min-h-screen flex-col bg-slate-950 text-white">
    <header class="p-4">
      <h1 class="text-2xl font-bold">Arena Pixel Client</h1>
      <p class="text-sm text-white/60">Synkad scenografi, spel och lotterier.</p>
    </header>
    <main class="flex flex-1 flex-col gap-6 p-4">
      <UCard v-if="!joined" class="max-w-xl bg-slate-900">
        <template #header>
          <h2 class="text-lg font-semibold">Gå med i showen</h2>
        </template>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormGroup label="Sektion">
            <UInput v-model="form.section" placeholder="A" />
          </UFormGroup>
          <UFormGroup label="Stolsrad">
            <UInput v-model.number="form.row" type="number" min="1" />
          </UFormGroup>
          <UFormGroup label="Stols-ID">
            <UInput v-model="form.seatId" placeholder="A12" />
          </UFormGroup>
          <UFormGroup label="Party-ID">
            <UInput v-model="form.partyId" placeholder="party-01" />
          </UFormGroup>
        </div>
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" @click="reset">Återställ</UButton>
            <UButton color="primary" @click="join">Anslut</UButton>
          </div>
        </template>
      </UCard>

      <div v-else class="grid flex-1 gap-4 lg:grid-cols-3">
        <div class="relative col-span-2 flex flex-col rounded-2xl bg-slate-900">
          <PixelStage class="h-[420px] flex-1" />
          <Transition name="fade">
            <div v-if="prize.active" class="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
              <div class="rounded-2xl bg-sky-600 px-6 py-4 text-center shadow-lg">
                <h3 class="text-xl font-bold">Vinstregn!</h3>
                <p class="text-sm text-white/80">{{ prize.prizes.join(', ') }}</p>
              </div>
            </div>
          </Transition>
        </div>
        <div class="space-y-4">
          <QuizClient
            v-if="quiz"
            :question="quiz.question"
            :choices="quiz.choices"
            :multi="quiz.multi"
            :time-limit="quiz.timeLimit"
            @submit="handleQuiz"
          />
          <ScratchCard
            image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=400&q=60"
            @revealed="handleScratch"
          />
          <BeatGame :bpm="beatGrid.bpm" :offsets="beatGrid.offsets" />
          <div class="rounded-xl bg-slate-900 p-4 text-sm text-white/70">
            <p>Biljetter: {{ tickets }}</p>
            <p>Score: {{ score }}</p>
          </div>
        </div>
      </div>
    </main>
    <ConnectionIndicator />
  </div>
</template>

<script setup lang="ts">
// Index-sidan hanterar join-flödet och binder orkestreringshändelser till UI-modulerna.
import { computed, onMounted, reactive, ref } from 'vue'
import PixelStage from '~/app/components/PixelStage.client.vue'
import ConnectionIndicator from '~/app/components/ConnectionIndicator.vue'
import QuizClient from '~/app/components/ui/QuizClient.vue'
import ScratchCard from '~/app/components/ui/ScratchCard.client.vue'
import BeatGame from '~/app/components/ui/BeatGame.client.vue'
import { useWs } from '~/app/plugins/ws.client'
import { useSequencer } from '~/app/composables/useSequencer'
import { useRenderer } from '~/app/composables/useRenderer'
import { useAppState } from '~/app/stores/appState'
import { useGameBus } from '~/app/composables/useGameBus'
import { useAddressing, type ClientContext } from '~/app/composables/useAddressing'
import type { PrizeDrawEvent, SequencePlayEvent, CmdSpriteEvent, CmdTextEvent, SceneLoadEvent } from '~/types/events'
import type { Timeline } from '~/types/timeline'

const ws = useWs()
const sequencer = useSequencer()
const renderer = useRenderer()
const store = useAppState()
const bus = useGameBus()
const { matchesAE } = useAddressing()

const joined = ref(false)
const form = reactive({ section: '', row: 1, seatId: '', partyId: '' })
const context = ref<ClientContext>({ partyIds: [], tickets: { ids: [], count: 0 }, capabilities: { webgl: true } })
const quiz = ref<{ question: string; choices: string[]; multi?: boolean; timeLimit?: number } | null>({
  question: 'Vem vann senaste matchen?',
  choices: ['Hemma', 'Borta', 'Oavgjort']
})
const beatGrid = reactive({ bpm: 110, offsets: Array.from({ length: 8 }, (_, i) => i * (60_000 / 110)) })
const tickets = computed(() => bus.state.tickets)
const score = computed(() => bus.state.score)
const prize = computed(() => store.prize)

const join = () => {
  joined.value = true
  context.value = {
    seatId: form.seatId,
    section: form.section,
    row: form.row,
    partyIds: form.partyId ? [form.partyId] : [],
    tickets: { ids: [], count: tickets.value },
    capabilities: { webgl: renderer.webgl }
  }
  ws.send({ type: 'clientJoin', payload: context.value })
}

const reset = () => {
  form.section = ''
  form.row = 1
  form.seatId = ''
  form.partyId = ''
}

const handleQuiz = (answer: number[]) => {
  ws.send({ type: 'clientAnswer', answer, questionId: 'demo' })
}

const handleScratch = () => {
  bus.emit({ type: 'ticket', payload: 1 })
}

const handleSequence = (event: SequencePlayEvent) => {
  sequencer.play(event.timeline as Timeline)
}

const handlePrize = (event: PrizeDrawEvent) => {
  store.showPrize(event.prizes, event.duration ?? 5000)
}

const applySpriteCmd = (event: CmdSpriteEvent | CmdTextEvent) => {
  if ('props' in event) {
    renderer.applySpriteProps(event.id, event.props)
  }
}

const handleSceneLoad = async (event: SceneLoadEvent) => {
  await renderer.loadScene(event.manifest)
}

onMounted(() => {
  ws.on('sequencePlay', (event: SequencePlayEvent & { address?: any }) => {
    if (event.address && !matchesAE(context.value, event.address)) return
    handleSequence(event)
  })
  ws.on('prizeDraw', (event: PrizeDrawEvent & { address?: any }) => {
    if (event.address && !matchesAE(context.value, event.address)) return
    handlePrize(event)
  })
  ws.on('cmdSprite', (event: CmdSpriteEvent & { address?: any }) => {
    if (event.address && !matchesAE(context.value, event.address)) return
    applySpriteCmd(event)
  })
  ws.on('cmdText', (event: CmdTextEvent & { address?: any }) => {
    if (event.address && !matchesAE(context.value, event.address)) return
    applySpriteCmd(event)
  })
  ws.on('sceneLoad', (event: SceneLoadEvent) => {
    handleSceneLoad(event)
  })
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

