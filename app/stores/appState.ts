import { defineStore } from 'pinia'

interface PrizeState {
  active: boolean
  prizes: string[]
  expiresAt: number
}

export const useAppState = defineStore('app', {
  state: () => ({
    backgroundColor: '#000000',
    connectionStatus: 'connecting' as 'connecting' | 'connected' | 'disconnected' | 'mock',
    prize: { active: false, prizes: [], expiresAt: 0 } as PrizeState,
    firedMacros: new Set<string>()
  }),
  actions: {
    setBackground(color: string) {
      this.backgroundColor = color
    },
    setConnection(status: 'connecting' | 'connected' | 'disconnected' | 'mock') {
      this.connectionStatus = status
    },
    showPrize(prizes: string[], duration = 5000) {
      this.prize = {
        active: true,
        prizes,
        expiresAt: Date.now() + duration
      }
      window.setTimeout(() => {
        this.prize.active = false
      }, duration)
    }
  }
})
