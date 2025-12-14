<template>
    <div class="min-h-screen bg-slate-900 text-white p-6">
        <h1 class="text-2xl font-bold text-green-400 mb-4">
            🎮 Event Timeline Simulator - Debugging
        </h1>

        <div class="space-y-4">
            <div class="bg-slate-800 p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">Basic Test</h2>
                <p class="text-green-300">✅ Page loads without router errors</p>
                <p class="text-blue-300">✅ Basic styling works</p>
            </div>

            <div class="bg-slate-800 p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">Component Test</h2>
                <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm" @click="testClick">
                    Test Button (No UButton)
                </button>
                <p v-if="clicked" class="text-green-400 mt-2">Button works!</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const clicked = ref(false)

const testClick = () => {
    clicked.value = true
    console.log('Button clicked successfully')
}
</script>