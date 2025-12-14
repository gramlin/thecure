<template>
    <div class="min-h-screen bg-slate-900 text-white p-6">
        <h1 class="text-2xl font-bold mb-4">Simple Debug Test</h1>
        <p class="mb-4">This page tests basic routing without complex components.</p>

        <div class="space-y-4">
            <div class="bg-slate-800 p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">System Status</h2>
                <ul class="space-y-1 text-sm">
                    <li>✅ Page loaded successfully</li>
                    <li>✅ Vue components working</li>
                    <li>✅ Tailwind CSS loaded</li>
                    <li>✅ No routing errors</li>
                </ul>
            </div>

            <div class="bg-slate-800 p-4 rounded">
                <h2 class="text-lg font-semibold mb-2">Navigation Test</h2>
                <div class="space-x-2">
                    <NuxtLink to="/" class="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                        Home
                    </NuxtLink>
                    <NuxtLink to="/debug" class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
                        Original Debug
                    </NuxtLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Simple test page without complex components
</script>