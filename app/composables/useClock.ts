import { useWs } from '~/app/plugins/ws.client'

export interface ClockAPI {
  now: () => number
  showTime: () => number
}

let cached: ClockAPI | null = null

/**
 * Composable som exponerar både lokal tid (`performance.now`) och orkestrerad showtid.
 * Resultatet cacheas så att alla konsumenter delar samma instans.
 */
export const useClock = (): ClockAPI => {
  if (cached) return cached
  const ws = useWs()
  cached = {
    now: () => performance.now(),
    showTime: () => ws.showTime()
  }
  return cached
}
