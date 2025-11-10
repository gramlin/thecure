import type { Timeline } from './timeline'

export interface BaseEvent {
  type: string
  [key: string]: any
}

export interface TimeSyncEvent extends BaseEvent {
  type: 'timeSync'
  clientSend: number
  serverTime: number
}

export interface ShowSyncEvent extends BaseEvent {
  type: 'showSync'
  t0: number
}

export interface SceneLoadEvent extends BaseEvent {
  type: 'sceneLoad'
  manifest: Record<string, any>
}

export interface SceneUnloadEvent extends BaseEvent {
  type: 'sceneUnload'
  ids: string[]
}

export interface CmdBgEvent extends BaseEvent {
  type: 'cmdBg'
  color?: string
}

export interface CmdSpriteEvent extends BaseEvent {
  type: 'cmdSprite'
  id: string
  props: Record<string, any>
}

export interface CmdTextEvent extends BaseEvent {
  type: 'cmdText'
  id: string
  props: Record<string, any>
}

export interface SequencePlayEvent extends BaseEvent {
  type: 'sequencePlay'
  timeline: Timeline
}

export interface SequenceStopEvent extends BaseEvent {
  type: 'sequenceStop'
  id?: string
}

export interface PrizeDrawEvent extends BaseEvent {
  type: 'prizeDraw'
  prizes: string[]
  duration?: number
}

export interface BeatGridEvent extends BaseEvent {
  type: 'beatGrid'
  bpm: number
  offsets: number[]
}

export interface ClientAnswerEvent extends BaseEvent {
  type: 'clientAnswer'
  questionId: string
  answer: number[]
}

export type OrchestrationEvent =
  | TimeSyncEvent
  | ShowSyncEvent
  | SceneLoadEvent
  | SceneUnloadEvent
  | CmdBgEvent
  | CmdSpriteEvent
  | CmdTextEvent
  | SequencePlayEvent
  | SequenceStopEvent
  | PrizeDrawEvent
  | BeatGridEvent
  | ClientAnswerEvent
