import { reactive } from 'vue'

type GameEvent = { type: string; payload?: any }

type Listener = (event: GameEvent) => void

const state = reactive({
  score: 0,
  tickets: 0,
  history: [] as GameEvent[],
  listeners: new Set<Listener>()
})

export const useGameBus = () => {
  const on = (handler: Listener) => {
    state.listeners.add(handler)
    return () => state.listeners.delete(handler)
  }

  const emit = (event: GameEvent) => {
    if (event.type === 'score') {
      state.score += event.payload ?? 0
    }
    if (event.type === 'ticket') {
      state.tickets += event.payload ?? 1
    }
    state.history.push(event)
    state.listeners.forEach((listener) => listener(event))
  }

  const reset = () => {
    state.score = 0
    state.tickets = 0
    state.history.length = 0
  }

  return {
    state,
    on,
    emit,
    reset
  }
}
