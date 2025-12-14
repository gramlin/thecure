import { reactive } from 'vue'

type GameEvent = { type: string; payload?: any }

type Listener = (event: GameEvent) => void

/**
 * Delad, reaktiv state för gamification.
 */
const state = reactive({
  score: 0,
  tickets: 0,
  history: [] as GameEvent[],
  listeners: new Set<Listener>()
})

/**
 * Exponerar en enkel eventbuss för spelrelaterade händelser (score/tickets).
 */
export const useGameBus = () => {
  /**
   * Registrera en lyssnare som triggas på varje game event.
   */
  const on = (handler: Listener) => {
    state.listeners.add(handler)
    return () => state.listeners.delete(handler)
  }

  /**
   * Sänd ett spel-event, uppdatera basstatistiken och notifiera lyssnare.
   */
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

  /**
   * Nollställ lokala poäng och historik – användbart inför ny session.
   */
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
