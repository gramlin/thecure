export type Easing =
  | 'linear'
  | 'inQuad'
  | 'outQuad'
  | 'inOutQuad'
  | 'inCubic'
  | 'outCubic'
  | 'inOutCubic'
  | 'inQuart'
  | 'outQuart'
  | 'inOutQuart'
  | 'inQuint'
  | 'outQuint'
  | 'inOutQuint'
  | 'inSine'
  | 'outSine'
  | 'inOutSine'
  | 'inExpo'
  | 'outExpo'
  | 'inOutExpo'
  | 'inBack'
  | 'outBack'
  | 'inOutBack'
  | 'outBounce'
  | 'outElastic'
  | 'outCirc'
  | 'inCirc'
  | 'inOutCirc'

export interface Keyframe<T = any> {
  t: number
  v: T
  ease?: Easing
}

export type Track = Keyframe[]

export interface Timeline {
  id?: string
  duration: number
  tracks: Record<string, Track>
}
