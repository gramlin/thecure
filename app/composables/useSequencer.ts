import { reactive } from 'vue'
import { useRenderer } from './useRenderer'
import { useClock } from './useClock'
import { useMacros } from './useMacros'
import type { Timeline, Keyframe, Easing } from '~/types/timeline'
import { useAppState } from '../stores/appState'
import { useWs } from '../plugins/ws.client'

interface ActiveTimeline {
  timeline: Timeline
  start: number
  last: number
  id: string
}

const easingMap: Record<Easing | string, (t: number) => number> = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => t * (2 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  inCubic: (t) => t * t * t,
  outCubic: (t) => --t * t * t + 1,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  inQuart: (t) => t * t * t * t,
  outQuart: (t) => 1 - --t * t * t * t,
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  inQuint: (t) => t * t * t * t * t,
  outQuint: (t) => 1 + --t * t * t * t * t,
  inOutQuint: (t) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),
  inSine: (t) => 1 - Math.cos((t * Math.PI) / 2),
  outSine: (t) => Math.sin((t * Math.PI) / 2),
  inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  inExpo: (t) => (t === 0 ? 0 : Math.pow(1024, t - 1)),
  outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutExpo: (t) =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? Math.pow(1024, t * 2 - 1) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2,
  inBack: (t) => t * t * (2.70158 * t - 1.70158),
  outBack: (t) => --t * t * (2.70158 * t + 1.70158) + 1,
  inOutBack: (t) => {
    const s = 1.70158 * 1.525
    if ((t *= 2) < 1) return (t * t * ((s + 1) * t - s)) / 2
    return ((t -= 2) * t * ((s + 1) * t + s) + 2) / 2
  },
  outBounce: (t) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t
    }
    if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    }
    if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    }
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  },
  outElastic: (t) => {
    if (t === 0) return 0
    if (t === 1) return 1
    return Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
  },
  inCirc: (t) => 1 - Math.sqrt(1 - t * t),
  outCirc: (t) => Math.sqrt(1 - --t * t),
  inOutCirc: (t) => (t < 0.5 ? (1 - Math.sqrt(1 - 4 * t * t)) / 2 : (Math.sqrt(1 - (2 * t - 2) ** 2) + 1) / 2)
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const lerpColor = (a: string, b: string, t: number) => {
  const ah = parseInt(a.replace('#', ''), 16)
  const bh = parseInt(b.replace('#', ''), 16)
  const ar = (ah >> 16) & 0xff
  const ag = (ah >> 8) & 0xff
  const ab = ah & 0xff
  const br = (bh >> 16) & 0xff
  const bg = (bh >> 8) & 0xff
  const bb = bh & 0xff
  const rr = Math.round(lerp(ar, br, t))
  const rg = Math.round(lerp(ag, bg, t))
  const rb = Math.round(lerp(ab, bb, t))
  return `#${((rr << 16) | (rg << 8) | rb).toString(16).padStart(6, '0')}`
}

const sampleTrack = (track: Keyframe[], time: number) => {
  if (!track.length) return null
  if (time <= track[0].t) return track[0].v
  for (let i = 0; i < track.length - 1; i++) {
    const current = track[i]
    const next = track[i + 1]
    if (time === next.t) return next.v
    if (time < next.t) {
      const progress = (time - current.t) / (next.t - current.t)
      const easing = easingMap[next.ease || 'linear'] || easingMap.linear
      const eased = easing(Math.min(Math.max(progress, 0), 1))
      if (typeof current.v === 'number' && typeof next.v === 'number') {
        return lerp(current.v, next.v, eased)
      }
      if (typeof current.v === 'string' && typeof next.v === 'string' && current.v.startsWith('#') && next.v.startsWith('#')) {
        return lerpColor(current.v, next.v, eased)
      }
      if (typeof current.v === 'object' || typeof next.v === 'object') {
        return progress < 1 ? current.v : next.v
      }
      return next.v
    }
  }
  return track[track.length - 1].v
}

const activeTimelines = reactive(new Map<string, ActiveTimeline>())
let running = false

const step = () => {
  if (!running) return
  const renderer = useRenderer()
  const macros = useMacros()
  const clock = useClock()
  const store = useAppState()
  const ws = useWs()
  const now = clock.showTime()
  const spriteUpdates: Record<string, Record<string, any>> = {}
  const textUpdates: Record<string, Record<string, any>> = {}

  activeTimelines.forEach((entry, key) => {
    const elapsed = now - entry.start
    if (elapsed > entry.timeline.duration) {
      activeTimelines.delete(key)
      return
    }
    entry.last = elapsed
    for (const [trackKey, frames] of Object.entries(entry.timeline.tracks)) {
      if (!frames.length) continue
      const parts = trackKey.split('.')
      if (!parts.length) continue
      if (parts[0] === 'macro') {
        const name = parts[1]
        for (const frame of frames) {
          const fireKey = `${key}-${trackKey}-${frame.t}`
          if (!store.firedMacros.has(fireKey) && elapsed >= frame.t) {
            store.firedMacros.add(fireKey)
            macros.run(name, frame.v as Record<string, any>, {
              timeline: entry.timeline,
              dispatch: (event: any) => ws.send(event)
            })
          }
        }
        continue
      }
      const value = sampleTrack(frames, elapsed)
      if (value === null || value === undefined) continue
      if (parts[0] === 'bg' && parts[1] === 'color') {
        store.setBackground(String(value))
      }
      if (parts[0] === 'sprite') {
        const id = parts[1]
        const prop = parts[2]
        spriteUpdates[id] = spriteUpdates[id] || {}
        spriteUpdates[id][prop] = value
      }
      if (parts[0] === 'text') {
        const id = parts[1]
        const prop = parts[2]
        textUpdates[id] = textUpdates[id] || {}
        textUpdates[id][prop] = value
      }
    }
  })

  Object.entries(spriteUpdates).forEach(([id, props]) => {
    renderer.applySpriteProps(id, props)
  })

  Object.entries(textUpdates).forEach(([id, props]) => {
    if (props.text) {
      renderer.ensureText(id, props.text as string)
    }
    renderer.applySpriteProps(id, props)
  })

  if (activeTimelines.size === 0) {
    running = false
    return
  }

  requestAnimationFrame(step)
}

export const useSequencer = () => {
  const play = (timeline: Timeline) => {
    const clock = useClock()
    const id = timeline.id || `timeline-${Date.now()}`
    activeTimelines.set(id, {
      id,
      timeline,
      start: clock.showTime(),
      last: 0
    })
    if (!running) {
      running = true
      requestAnimationFrame(step)
    }
    return id
  }

  const stop = (id?: string) => {
    if (id) {
      activeTimelines.delete(id)
    } else {
      activeTimelines.clear()
    }
  }

  return { play, stop, activeTimelines }
}

export const __sequencerTest = { sampleTrack }

