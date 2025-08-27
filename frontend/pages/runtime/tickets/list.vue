<script setup lang="ts">
const entity = 'tickets'
const baseURL = process.client ? (localStorage.getItem('API_BASE') || 'http://localhost:8000') : ''
const items = ref<any[]>([])
const error = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`${baseURL}/api/${entity}/records`)
    if (!res.ok) throw new Error(await res.text())
    items.value = await res.json()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6 space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Tickets</h2>
          <div class="flex gap-2">
            <UButton to="/runtime/tickets/new">New</UButton>
            <UButton to="/">Home</UButton>
          </div>
        </div>
      </template>

      <div v-if="loading" class="py-8"><ULoading /></div>

      <ul v-else class="space-y-2">
        <li v-for="it in items" :key="it.id" class="p-3 border rounded">
          <div class="flex justify-between items-center">
            <div>
              <strong>{{ it.title }}</strong>
              <div class="text-sm text-gray-600">{{ it.status }}</div>
            </div>
            <div class="text-xs text-gray-500">{{ new Date(it.created_at).toLocaleString() }}</div>
          </div>
        </li>
      </ul>

      <template #footer>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </template>
    </UCard>
  </div>
</template>
