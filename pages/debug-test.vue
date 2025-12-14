<template>
    <div class="min-h-screen bg-slate-900 text-white p-6">
        <h1 class="text-2xl font-bold text-green-400 mb-6">
            🎮 Debug Fixed - Test Version
        </h1>

        <div class="bg-slate-800 p-4 rounded-lg">
            <h2 class="text-lg font-semibold mb-3">Simple Test</h2>
            <p class="text-green-300">✅ This page loads successfully</p>
            <p class="text-blue-300">Counter: {{ counter }}</p>
            <button class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm mt-2" @click="counter++">
                Click me: {{ counter }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const counter = ref(0)
</script>