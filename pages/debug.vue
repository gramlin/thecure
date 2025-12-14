<template>
  <div class="min-h-screen space-y-6 p-6 text-white" :style="{ backgroundColor: currentBgColor }">
    <h1 class="text-2xl font-bold text-green-400 debug-test">
      🎮 Event Timeline Simulator - Working!
    </h1>

    <div class="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
      <h2 class="mb-2 text-lg font-semibold">
        Status & Controls
      </h2>
      <div class="grid gap-2 md:grid-cols-3">
        <p class="text-green-300">
          ✅ System: {{ systemStatus }}
        </p>
        <p class="text-blue-300">
          🎨 Background: {{ currentBgColor }}
        </p>
        <p class="text-purple-300">
          ⏰ Events: {{ logs.length }} logged
        </p>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Simple Demo Area -->
      <div class="rounded-lg border border-slate-700 p-4 bg-slate-900/30">
        <h3 class="mb-2 font-semibold text-purple-300">
          🎨 Visual Demo Area
        </h3>

        <div class="h-64 rounded border border-slate-600 relative overflow-hidden"
          :style="{ backgroundColor: demoAreaColor }">
          <div
            class="absolute w-16 h-16 bg-white rounded-full transition-all duration-500 flex items-center justify-center"
            :style="{
              left: spriteX + 'px',
              top: spriteY + 'px',
              transform: `rotate(${spriteRotation}deg) scale(${spriteScale})`,
              backgroundColor: spriteColor
            }">
            🎯
          </div>
          <div class="absolute bottom-2 left-2 text-xs text-white/60">
            Demo Canvas (CSS-baserad)
          </div>
        </div>

        <div class="mt-3 space-x-2">
          <button class="bg-sky-600 hover:bg-sky-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            @click="resetSprite">
            Reset Sprite
          </button>
          <button class="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded text-sm font-medium transition-colors"
            @click="randomSpriteColor">
            Random Color
          </button>
        </div>
      </div>

      <!-- Event Controls -->
      <div class="rounded-lg border border-slate-700 p-4 bg-slate-900/30">
        <h3 class="mb-2 font-semibold text-blue-300">
          🎛️ Event Simulator
        </h3>

        <div class="space-y-3">
          <!-- Background Color Events -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-white/80">
              Background Events:
            </p>
            <div class="flex flex-wrap gap-2">
              <button class="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateBackgroundEvent('#1a1a2e')">
                Dark Blue
              </button>
              <button class="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateBackgroundEvent('#16213e')">
                Navy
              </button>
              <button class="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateBackgroundEvent('#0f3460')">
                Ocean
              </button>
              <button class="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateBackgroundEvent('#533483')">
                Purple
              </button>
            </div>
          </div>

          <!-- Graphics Events -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-white/80">
              Sprite Events:
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                class="border border-slate-600 hover:border-slate-500 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateRotateEvent">
                🔄 Rotate
              </button>
              <button
                class="border border-slate-600 hover:border-slate-500 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateScaleEvent">
                📏 Scale
              </button>
              <button
                class="border border-slate-600 hover:border-slate-500 px-2 py-1 rounded text-xs font-medium transition-colors"
                @click="simulateMoveEvent">
                📍 Move
              </button>
            </div>
          </div>

          <!-- Auto Events -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-white/80">
              Auto Demo:
            </p>
            <div class="flex gap-2">
              <button
                class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
                @click="startAutoDemo" :disabled="isDemoRunning">
                ▶️ Start Auto
              </button>
              <button
                class="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed px-3 py-2 rounded text-sm font-medium transition-colors"
                @click="stopAutoDemo" :disabled="!isDemoRunning">
                ⏹️ Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="rounded-lg border border-slate-700 p-4 bg-slate-900/50">
      <h3 class="mb-2 font-semibold text-cyan-300">
        📝 Event Log
      </h3>
      <div class="max-h-40 overflow-y-auto">
        <pre class="text-xs text-green-300 font-mono">{{ logs.slice(0, 10).join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
// Event Timeline Simulator - Simple version without TypeScript
import { ref, onMounted, onUnmounted } from 'vue'

const logs = ref(['🚀 Event simulator initialized'])
const currentBgColor = ref('#0f172a')
const systemStatus = ref('Ready')
const isDemoRunning = ref(false)

// Demo sprite properties
const spriteX = ref(100)
const spriteY = ref(100)
const spriteRotation = ref(0)
const spriteScale = ref(1)
const spriteColor = ref('#ffffff')
const demoAreaColor = ref('#1e293b')

let demoInterval = null

onMounted(() => {
  log('system', 'Event simulator mounted successfully')
  systemStatus.value = 'Active'
})

onUnmounted(() => {
  if (demoInterval) {
    clearInterval(demoInterval)
  }
})

// Background event simulation
const simulateBackgroundEvent = (color) => {
  currentBgColor.value = color
  demoAreaColor.value = color
  log('event', `Background changed to ${color}`)
}

// Sprite event simulation
const simulateRotateEvent = () => {
  spriteRotation.value = Math.random() * 360
  log('event', `Sprite rotated to ${spriteRotation.value.toFixed(1)}°`)
}

const simulateScaleEvent = () => {
  spriteScale.value = 0.5 + Math.random() * 1.5
  log('event', `Sprite scaled to ${spriteScale.value.toFixed(2)}x`)
}

const simulateMoveEvent = () => {
  spriteX.value = 20 + Math.random() * 200
  spriteY.value = 20 + Math.random() * 150
  log('event', `Sprite moved to (${spriteX.value.toFixed(0)}, ${spriteY.value.toFixed(0)})`)
}

// Utility functions
const resetSprite = () => {
  spriteX.value = 100
  spriteY.value = 100
  spriteRotation.value = 0
  spriteScale.value = 1
  spriteColor.value = '#ffffff'
  log('system', 'Sprite reset to default position')
}

const randomSpriteColor = () => {
  const colors = ['#ff0066', '#00ff66', '#6600ff', '#ff6600', '#0066ff', '#ffffff']
  spriteColor.value = colors[Math.floor(Math.random() * colors.length)]
  log('event', `Sprite color changed to ${spriteColor.value}`)
}

// Auto demo
const startAutoDemo = () => {
  if (isDemoRunning.value) return

  isDemoRunning.value = true
  log('system', 'Starting auto demo...')

  const events = [
    () => simulateBackgroundEvent('#1a1a2e'),
    () => simulateMoveEvent(),
    () => simulateBackgroundEvent('#16213e'),
    () => simulateRotateEvent(),
    () => simulateBackgroundEvent('#0f3460'),
    () => simulateScaleEvent(),
    () => simulateBackgroundEvent('#533483'),
    () => randomSpriteColor(),
    () => simulateBackgroundEvent('#0f172a'),
    () => resetSprite()
  ]

  let eventIndex = 0
  demoInterval = setInterval(() => {
    events[eventIndex % events.length]()
    eventIndex++
  }, 2000)
}

const stopAutoDemo = () => {
  if (!isDemoRunning.value) return

  isDemoRunning.value = false
  if (demoInterval) {
    clearInterval(demoInterval)
    demoInterval = null
  }
  log('system', 'Auto demo stopped')
}

const log = (type, message) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${type.toUpperCase()}: ${message}`)

  // Keep only last 50 entries
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}
</script>
