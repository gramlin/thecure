<template>
    <div class="min-h-screen bg-slate-900 text-white p-6">
        <h1 class="text-2xl font-bold text-green-400 mb-4">
            🎮 Minimal Debug Test
        </h1>

        <div class="space-y-4">
            <div class="bg-slate-800 p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">Error Test</h2>
                <p class="text-green-300">✅ Page loads without errors</p>
                <p class="text-blue-300">✅ Vue reactivity working: {{ counter }}</p>
                <button class="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm mt-2" @click="counter++">
                    Increment: {{ counter }}
                </button>
            </div>

            <div class="bg-slate-800 p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">Navigation</h2>
                <div class="space-x-2">
                    <NuxtLink to="/" class="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm">
                        ← Back to Home
                    </NuxtLink>
                    <NuxtLink to="/debug-simple" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                        Simple Debug
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const counter = ref(0)
</script>