import { reactive } from 'vue'
import type { Macro, MacroCtx } from '~/types/macros'
import { useRenderer } from './useRenderer'
import { useClock } from './useClock'
import { useAssets } from './useAssets'

/**
 * Hjälpfunktion som kör en animation loop via `requestAnimationFrame` och interpolerar 0→1.
 */
const runAnimation = (duration: number, step: (t: number) => void, complete?: () => void) => {
  const start = performance.now()
  const loop = (now: number) => {
    const progress = Math.min((now - start) / duration, 1)
    step(progress)
    if (progress < 1) {
      requestAnimationFrame(loop)
    } else {
      complete?.()
    }
  }
  requestAnimationFrame(loop)
}

/**
 * Skapar samlingen av fördefinierade makron. Varje makro får både runtime-ctx och specifika argument.
 */
const createMacros = (ctxFactory: () => MacroCtx): Record<string, Macro> => {
  const ctx = ctxFactory()
  return {
    pulseColor: async (macroCtx, args) => {
      const id = args.id
      const from = args.from || '#ffffff'
      const to = args.to || '#ff0066'
      const duration = args.duration || 1000
      runAnimation(duration, (t) => {
        const mix = Math.sin(t * Math.PI)
        const color = `#${(
          ((1 - mix) * parseInt(from.replace('#', ''), 16) + mix * parseInt(to.replace('#', ''), 16)) >> 0
        )
          .toString(16)
          .padStart(6, '0')}`
        macroCtx.renderer.applySpriteProps(id, { tint: color })
      })
    },
    shake: async (macroCtx, args) => {
      const id = args.id
      const intensity = args.intensity || 5
      const duration = args.duration || 500
      const original = { x: args.x || 0, y: args.y || 0 }
      runAnimation(duration, (t) => {
        const decay = 1 - t
        const ox = (Math.random() - 0.5) * intensity * decay
        const oy = (Math.random() - 0.5) * intensity * decay
        macroCtx.renderer.applySpriteProps(id, { x: original.x + ox, y: original.y + oy })
      }, () => {
        macroCtx.renderer.applySpriteProps(id, original)
      })
    },
    orbit: async (macroCtx, args) => {
      const id = args.id
      const radius = args.radius || 50
      const centerX = args.centerX || 0
      const centerY = args.centerY || 0
      const duration = args.duration || 2000
      runAnimation(duration, (t) => {
        const angle = t * Math.PI * 2
        macroCtx.renderer.applySpriteProps(id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        })
      })
    },
    flash: async (macroCtx, args) => {
      const id = args.id
      const color = args.color || '#ffffff'
      macroCtx.renderer.applySpriteProps(id, { alpha: 1, tint: color })
      window.setTimeout(() => {
        macroCtx.renderer.applySpriteProps(id, { alpha: 0.5 })
      }, args.duration || 200)
    },
    typewriterText: async (macroCtx, args) => {
      const id = args.id
      const text = args.text || ''
      const duration = args.duration || 1500
      const letters = text.split('')
      const start = macroCtx.clock.now()
      const step = () => {
        const elapsed = macroCtx.clock.now() - start
        const count = Math.min(letters.length, Math.floor((elapsed / duration) * letters.length))
        macroCtx.renderer.ensureText(id, letters.slice(0, count).join(''))
        if (count < letters.length) {
          requestAnimationFrame(step)
        }
      }
      step()
    }
  }
}

let cache: { macros: Record<string, Macro>; baseCtx: MacroCtx } | null = null

/**
 * Composable som kapslar makrosamlingen och erbjuder `run(name, args)`.
 * Kontexten återanvänds men kan överskridas per körning.
 */
export const useMacros = () => {
  if (!cache) {
    const renderer = useRenderer()
    const clock = useClock()
    const assets = useAssets()
    const baseCtx: MacroCtx = {
      timeline: { duration: 0, tracks: {} },
      renderer,
      assets,
      clock,
      state: reactive({}),
      dispatch: () => {}
    }
    cache = { macros: createMacros(() => baseCtx), baseCtx }
  }

  /**
   * Kör ett namngivet makro med valfria argument och kontextoverride.
   */
  const run = (name: string, args: Record<string, any> = {}, overrides: Partial<MacroCtx> = {}) => {
    const macro = cache!.macros[name]
    if (!macro) return
    const ctx = { ...cache!.baseCtx, ...overrides }
    macro(ctx as MacroCtx, args)
  }

  return { run }
}

