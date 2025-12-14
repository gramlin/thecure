<template>
    <div class="min-h-screen bg-slate-900 text-white p-6">
        <h1 class="text-2xl font-bold text-green-400 mb-6">
            🎮 Debug Page - Fixed Version
        </h1>

        <div class="space-y-6">
            <!-- Status Section -->
            <div class="bg-slate-800 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-3 text-blue-400">System Status</h2>
                <div class="grid gap-2 md:grid-cols-3">
                    <div class="text-green-300">
                        ✅ System: {{ status }}
                    </div>
                    <div class="text-blue-300">
                        🎨 Background: {{ bgColor }}
                    </div>
                    <div class="text-purple-300">
                        ⏰ Events: {{ eventCount }} logged
                    </div>
                </div>
            </div>

            <!-- Demo Area -->
            <div class="bg-slate-800 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-3 text-purple-400">Visual Demo</h2>
                <div class="h-48 rounded border border-slate-600 relative bg-slate-700 overflow-hidden"
                    :style="{ backgroundColor: currentBg }">
                    <div class="absolute w-12 h-12 bg-white rounded-full transition-all duration-500 flex items-center justify-center text-lg"
                        :style="{
                            left: x + 'px',
                            top: y + 'px',
                            transform: `rotate(${rotation}deg) scale(${scale})`,
                            backgroundColor: spriteColor
                        }">
                        🎯
                    </div>
                </div>

                <!-- Controls -->
                <div class="mt-4 flex flex-wrap gap-2">
                    <button class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm" @click="moveSprite">
                        Move
                    </button>
                    <button class="bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm" @click="rotateSprite">
                        Rotate
                    </button>
                    <button class="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm" @click="changeBg">
                        Change Background
                    </button>
                    <button class="bg-gray-600 hover:bg-gray-700 px-3 py-2 rounded text-sm" @click="reset">
                        Reset
                    </button>
                </div>
            </div>

            <!-- Event Log -->
            <div class="bg-slate-800 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-3 text-cyan-400">Event Log</h2>
                <div class="bg-slate-900 p-3 rounded text-xs font-mono text-green-300 max-h-32 overflow-y-auto">
                    <div v-for="(event, index) in events" :key="index">
                        {{ event }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Simple reactive state
const status = ref('Active')
const bgColor = ref('#1e293b')
const eventCount = ref(0)
const currentBg = ref('#1e293b')

const x = ref(50)
const y = ref(50)
const rotation = ref(0)
const scale = ref(1)
const spriteColor = ref('#ffffff')

const events = ref([
    '[' + new Date().toLocaleTimeString() + '] System initialized'
])

// Simple functions
const moveSprite = () => {
    x.value = Math.random() * 200 + 20
    y.value = Math.random() * 120 + 20
    addEvent('Sprite moved to (' + x.value.toFixed(0) + ', ' + y.value.toFixed(0) + ')')
}

const rotateSprite = () => {
    rotation.value = Math.random() * 360
    addEvent('Sprite rotated to ' + rotation.value.toFixed(1) + '°')
}

const changeBg = () => {
    const colors = ['#1e293b', '#1a1a2e', '#16213e', '#0f3460', '#533483']
    currentBg.value = colors[Math.floor(Math.random() * colors.length)]
    bgColor.value = currentBg.value
    addEvent('Background changed to ' + currentBg.value)
}

const reset = () => {
    x.value = 50
    y.value = 50
    rotation.value = 0
    scale.value = 1
    spriteColor.value = '#ffffff'
    currentBg.value = '#1e293b'
    bgColor.value = '#1e293b'
    addEvent('System reset')
}

const addEvent = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    events.value.unshift('[' + timestamp + '] ' + message)
    eventCount.value = events.value.length

    // Keep only last 20 events
    if (events.value.length > 20) {
        events.value = events.value.slice(0, 20)
    }
}
</script>