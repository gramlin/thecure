import { useWs } from './ws.client'

export default defineNuxtPlugin(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error)
  }

  const ws = useWs()
  let frames = 0
  let last = performance.now()
  let droppedFrames = 0

  const loop = (time: number) => {
    frames++
    if (time - last >= 1000) {
      const expected = (time - last) / (1000 / 60)
      droppedFrames += Math.max(0, Math.round(expected - frames))
      frames = 0
      last = time
    }
    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)

  window.setInterval(() => {
    const stats = ws.getStats()
    const payload = JSON.stringify({
      ts: Date.now(),
      fps: frames,
      rtt: stats.rtt,
      offset: stats.offset,
      droppedFrames
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/telemetry', payload)
    } else {
      fetch('/telemetry', { method: 'POST', body: payload, keepalive: true })
    }
    frames = 0
    droppedFrames = 0
  }, 5000)
})
