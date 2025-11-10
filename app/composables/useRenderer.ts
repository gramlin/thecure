import { Application, Container, Sprite, Text } from 'pixi.js'
import { useAssets } from './useAssets'

/**
 * PixiJS-scenobjekt i WebGL-läget.
 */
interface SceneObject {
  node: Sprite | Text
  type: 'sprite' | 'text'
}

/**
 * Representation av objekt när vi renderar via Canvas2D.
 */
interface FallbackObject {
  type: 'sprite' | 'text'
  image?: HTMLImageElement
  text?: string
  props: Record<string, any>
}

/**
 * Globalt render-state som delas mellan alla komponenter.
 */
interface RendererState {
  app: Application | null
  stage: Container | null
  objects: Map<string, SceneObject>
  webgl: boolean
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  fallback: Map<string, FallbackObject>
}

/**
 * Avgör om WebGL-stöd finns och Pixi kan använda sin standardrenderer.
 */
const detectWebGL = () => {
  const fn = (Application as unknown as { isWebGLSupported?: () => boolean }).isWebGLSupported
  return typeof fn === 'function' ? fn() : true
}

const state: RendererState = {
  app: null,
  stage: null,
  objects: new Map(),
  webgl: detectWebGL(),
  canvas: null,
  ctx: null,
  fallback: new Map()
}

/**
 * Initierar Pixi-applikationen eller Canvas2D-fallback beroende på stöd.
 */
const ensureApp = async (canvas?: HTMLCanvasElement) => {
  if (!state.app && !state.ctx) {
    state.webgl = detectWebGL()
    if (state.webgl) {
      state.app = new Application()
      await state.app.init({
        canvas,
        backgroundAlpha: 0,
        eventMode: 'static',
        antialias: true,
        resizeTo: window
      })
      state.stage = state.app.stage
    } else if (canvas) {
      state.canvas = canvas
      state.ctx = canvas.getContext('2d')
      if (state.ctx) {
        state.ctx.fillStyle = '#000'
        state.ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  } else if (!state.webgl && canvas && state.canvas !== canvas) {
    state.canvas = canvas
    state.ctx = canvas.getContext('2d')
  }
  return state.app
}

/**
 * Använder ett props-objekt på både sprites och text-noder.
 */
const applyCommonProps = (node: Sprite | Text, props: Record<string, any>) => {
  if ('x' in props) node.x = props.x
  if ('y' in props) node.y = props.y
  if ('rotation' in props) node.rotation = props.rotation
  if ('alpha' in props) node.alpha = props.alpha
  if ('tint' in props && node instanceof Sprite) {
    const tint = props.tint as string
    node.tint = typeof tint === 'string' ? parseInt(tint.replace('#', ''), 16) : (tint as number)
  }
  if ('scale' in props) {
    node.scale.set(props.scale)
  }
  if ('scaleX' in props) node.scale.x = props.scaleX
  if ('scaleY' in props) node.scale.y = props.scaleY
  if ('anchorX' in props && 'anchor' in node) {
    ;(node as Sprite).anchor.x = props.anchorX
  }
  if ('anchorY' in props && 'anchor' in node) {
    ;(node as Sprite).anchor.y = props.anchorY
  }
  if ('text' in props && node instanceof Text) {
    node.text = props.text
  }
}

/**
 * Renderar hela scenen i Canvas2D-läget baserat på den lokala fallback-kartan.
 */
const renderFallback = () => {
  if (!state.ctx || !state.canvas) return
  const ctx = state.ctx
  const { width, height } = state.canvas
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, width, height)
  for (const obj of state.fallback.values()) {
    if (obj.type === 'sprite' && obj.image) {
      const img = obj.image
      const x = obj.props.x ?? 0
      const y = obj.props.y ?? 0
      const scaleX = obj.props.scaleX ?? obj.props.scale ?? 1
      const scaleY = obj.props.scaleY ?? obj.props.scale ?? 1
      const alpha = obj.props.alpha ?? 1
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)
      if (obj.props.rotation) {
        ctx.rotate(obj.props.rotation)
      }
      ctx.drawImage(img, -(img.width / 2) * scaleX, -(img.height / 2) * scaleY, img.width * scaleX, img.height * scaleY)
      ctx.restore()
    }
    if (obj.type === 'text' && obj.text) {
      ctx.save()
      ctx.fillStyle = '#fff'
      ctx.font = '24px sans-serif'
      ctx.fillText(obj.text, obj.props.x ?? 0, obj.props.y ?? 0)
      ctx.restore()
    }
  }
}

/**
 * Composable som kapslar scenhantering för PixiJS/Canvas och exponerar ett förenklat API.
 */
export const useRenderer = () => {
  const assets = useAssets()

  /**
   * Montera renderern på ett givet canvas-element.
   */
  const mount = async (canvas: HTMLCanvasElement) => {
    await ensureApp(canvas)
  }

  /**
   * Ladda scenmanifest (texturer + sprites) innan de används i timeline.
   */
  const loadScene = async (manifest: Record<string, any>) => {
    if (!state.stage && !state.ctx) await ensureApp(state.canvas || undefined)
    if (manifest.textures) {
      await assets.preload(manifest.textures)
    }
    if (manifest.sprites) {
      for (const sprite of manifest.sprites) {
        await ensureSprite(sprite.id, sprite.texture)
      }
    }
  }

  /**
   * Säkerställ att en sprite finns i scenen i både WebGL- och fallback-läge.
   */
  const ensureSprite = async (id: string, textureId: string) => {
    if (!state.stage && !state.ctx) await ensureApp(state.canvas || undefined)
    if (state.webgl) {
      if (state.objects.has(id)) return
      const url = await assets.getTexture(textureId)
      const sprite = Sprite.from(url)
      sprite.name = id
      state.stage!.addChild(sprite)
      state.objects.set(id, { node: sprite, type: 'sprite' })
    } else {
      if (state.fallback.has(id)) return
      const url = await assets.getTexture(textureId)
      const img = new Image()
      img.src = url
      state.fallback.set(id, { type: 'sprite', image: img, props: {} })
      img.onload = () => renderFallback()
    }
  }

  /**
   * Skapa eller uppdatera en textnod med valfritt stilobjekt.
   */
  const ensureText = async (id: string, content: string, style?: any) => {
    if (!state.stage && !state.ctx) await ensureApp(state.canvas || undefined)
    if (state.webgl) {
      if (state.objects.has(id)) {
        const obj = state.objects.get(id)!
        if (obj.node instanceof Text) {
          obj.node.text = content
        }
        return
      }
      const text = new Text({ text: content, style })
      text.name = id
      state.stage!.addChild(text)
      state.objects.set(id, { node: text, type: 'text' })
    } else {
      state.fallback.set(id, { type: 'text', text: content, props: {} })
      renderFallback()
    }
  }

  /**
   * Uppdatera transformations- och stilprops för en sprite/text.
   */
  const applySpriteProps = (id: string, props: Record<string, any>) => {
    if (state.webgl) {
      const obj = state.objects.get(id)
      if (!obj) return
      applyCommonProps(obj.node, props)
    } else {
      const obj = state.fallback.get(id)
      if (!obj) return
      obj.props = { ...obj.props, ...props }
      if (props.text) obj.text = props.text
      renderFallback()
    }
  }

  /**
   * Ta bort ett objekt från scenen och rensa resurser.
   */
  const destroySprite = (id: string) => {
    if (state.webgl) {
      const obj = state.objects.get(id)
      if (!obj) return
      state.stage?.removeChild(obj.node)
      obj.node.destroy()
      state.objects.delete(id)
    } else {
      state.fallback.delete(id)
      renderFallback()
    }
  }

  return {
    mount,
    loadScene,
    ensureSprite,
    ensureText,
    applySpriteProps,
    destroySprite,
    get app() {
      return state.app
    },
    get webgl() {
      return state.webgl
    }
  }
}

