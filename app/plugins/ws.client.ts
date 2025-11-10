import mqtt, { MqttClient } from 'mqtt'
import { TimeSyncEvent, ShowSyncEvent } from '~/types/events'

type Handler = (event: any) => void

type Transport = WebSocket | MqttClient | null

type Status = 'connecting' | 'connected' | 'disconnected' | 'mock'

/**
 * Hanterar WebSocket- eller MQTT-anslutningen mot orkestreringslagret och distribuerar events.
 */
class OrchestrationClient {
  private url: string
  private ws: Transport = null
  private heartbeatTimer?: number
  private reconnectTimer?: number
  private handlers = new Map<string, Set<Handler>>()
  private timeOffset = 0
  private rtt = 0
  private showStart = 0
  private status: Status = 'connecting'

  constructor(url: string) {
    this.url = url
    if (!this.url) {
      this.status = 'mock'
      this.dispatch('status', { status: this.status })
      return
    }
    if (process.client) {
      this.connect()
      window.addEventListener('beforeunload', () => this.dispose())
    }
  }

  /**
   * Etablerar anslutning mot WebSocket eller MQTT beroende på URL-schema.
   */
  private connect() {
    this.updateStatus('connecting')
    if (this.url.startsWith('mqtt')) {
      this.ws = mqtt.connect(this.url)
      this.ws.on('connect', () => this.handleOpen())
      this.ws.on('message', (_topic: string, payload: Buffer) => this.handleMessage(payload.toString()))
      this.ws.on('close', () => this.handleClose())
      this.ws.on('error', () => this.handleClose())
      ;(this.ws as MqttClient).subscribe('#')
    } else {
      const ws = new WebSocket(this.url)
      ws.addEventListener('open', () => this.handleOpen())
      ws.addEventListener('close', () => this.handleClose())
      ws.addEventListener('error', () => this.handleClose())
      ws.addEventListener('message', (event) => this.handleMessage(String(event.data)))
      this.ws = ws
    }
  }

  private updateStatus(status: Status) {
    this.status = status
    this.dispatch('status', { status })
  }

  /**
   * Körs när transporten har öppnats och vi kan börja skicka hjärtslag.
   */
  private handleOpen() {
    this.clearReconnect()
    this.startHeartbeat()
    this.updateStatus('connected')
  }

  /**
   * Påbörjar återanslutning och stoppar hjärtslag efter stängd anslutning.
   */
  private handleClose() {
    this.stopHeartbeat()
    this.updateStatus('disconnected')
    this.scheduleReconnect()
  }

  /**
   * Avkodar inkommande JSON och dispatchar till lyssnare.
   */
  private handleMessage(data: string) {
    try {
      const event = JSON.parse(data)
      this.dispatch(event.type || event.event, event)
    } catch (err) {
      console.error('Failed to parse event', err)
    }
  }

  /**
   * Skickar ping-varje 10:e sekund för att hålla anslutningen vid liv.
   */
  private startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping', ts: Date.now() })
    }, 10000)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
  }

  /**
   * Schemalägger ett nytt anslutningsförsök.
   */
  private scheduleReconnect() {
    if (!this.url || this.status === 'mock') return
    if (this.reconnectTimer) return
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined
      this.connect()
    }, 2000)
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  /**
   * Prenumerera på en viss eventtyp. Returnerar en unsubscribe-funktion.
   */
  on(type: string, handler: Handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
    return () => this.handlers.get(type)!.delete(handler)
  }

  /**
   * Skicka ett event till orkestreringen.
   */
  send(event: any) {
    if (!this.ws) return
    const payload = JSON.stringify(event)
    if (this.ws instanceof WebSocket) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(payload)
      }
    } else {
      this.ws.publish(event.topic || '', payload)
    }
  }

  private dispatch(type: string, event: any) {
    if (!type) return
    if (type === 'timeSync') {
      this.onTimeSync(event as TimeSyncEvent)
    }
    if (type === 'showSync') {
      this.onShowSync(event as ShowSyncEvent)
    }
    const handlers = this.handlers.get(type)
    handlers?.forEach((handler) => handler(event))
  }

  /**
   * Uppdaterar RTT och offset baserat på TimeSync-eventet.
   */
  private onTimeSync(event: TimeSyncEvent) {
    const now = performance.now()
    this.rtt = now - event.clientSend
    this.timeOffset = event.serverTime - (now - this.rtt / 2)
  }

  /**
   * Sparar starttid för showen för att kunna ge relativ showtid.
   */
  private onShowSync(event: ShowSyncEvent) {
    this.showStart = event.t0
  }

  /**
   * Returnerar den nuvarande showtiden (ms) baserat på offset och start.
   */
  showTime() {
    return performance.now() + this.timeOffset - this.showStart
  }

  /**
   * Statistik för telemetri (ms offset/rtt).
   */
  getStats() {
    return {
      offset: this.timeOffset,
      rtt: this.rtt
    }
  }

  /**
   * Stänger anslutningen och städar lyssnare.
   */
  dispose() {
    this.stopHeartbeat()
    if (this.ws instanceof WebSocket) {
      this.ws.close()
    } else if (this.ws) {
      this.ws.end(true)
    }
    this.handlers.clear()
  }
}

const clients = new Map<string, OrchestrationClient>()

/**
 * Delad instans av orkestreringsklienten baserat på aktuell `WS_URL`.
 */
export const useWs = () => {
  const config = useRuntimeConfig()
  const key = config.public.wsUrl || 'mock'
  if (!clients.has(key)) {
    clients.set(key, new OrchestrationClient(config.public.wsUrl))
  }
  return clients.get(key)!
}

const pluginFactory = () => ({
  provide: {
    ws: useWs()
  }
})

const plugin = typeof defineNuxtPlugin === 'function' ? defineNuxtPlugin(pluginFactory) : (pluginFactory as any)

export default plugin

