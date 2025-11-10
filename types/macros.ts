import type { Timeline } from './timeline'

type Dispatch = (event: any) => void

export interface ClockAPI {
  now: () => number
  showTime: () => number
}

export interface AssetsAPI {
  getTexture: (id: string) => Promise<string>
  preload: (manifest: Record<string, string>) => Promise<void>
}

export interface RendererAPI {
  loadScene: (manifest: Record<string, any>) => Promise<void>
  ensureSprite: (id: string, texture: string) => Promise<void>
  applySpriteProps: (id: string, props: Record<string, any>) => void
  destroySprite: (id: string) => void
}

export interface MacroCtx {
  timeline: Timeline
  renderer: RendererAPI
  assets: AssetsAPI
  clock: ClockAPI
  state: Record<string, any>
  dispatch: Dispatch
}

export type Macro = (ctx: MacroCtx, args: Record<string, any>) => void | Promise<void>
