<template>
    <div class="min-h-screen bg-red-950 text-white flex items-center justify-center p-6">
        <div class="max-w-md w-full bg-red-900/50 rounded-lg p-6">
            <h1 class="text-2xl font-bold mb-4 text-red-200">
                ⚠️ Application Error
            </h1>

            <div class="space-y-3">
                <div>
                    <h2 class="font-semibold text-red-300">Error Details:</h2>
                    <p class="text-red-100 text-sm bg-red-800/30 p-2 rounded">
                        {{ error.statusMessage || error.message || 'Unknown error occurred' }}
                    </p>
                </div>

                <div v-if="error.stack">
                    <h2 class="font-semibold text-red-300">Stack Trace:</h2>
                    <pre
                        class="text-xs text-red-200 bg-red-800/30 p-2 rounded overflow-auto max-h-32">{{ error.stack }}</pre>
                </div>

                <div class="flex gap-2 mt-6">
                    <button @click="handleError"
                        class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                        🏠 Go Home
                    </button>
                    <button @click="refresh"
                        class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded text-sm font-medium transition-colors">
                        🔄 Refresh
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
interface NuxtError {
    statusCode?: number
    statusMessage?: string
    message?: string
    stack?: string
}

interface Props {
    error: NuxtError
}

const props = defineProps<Props>()

const handleError = async () => {
    window.location.href = '/'
}

const refresh = () => {
    window.location.reload()
}
</script>