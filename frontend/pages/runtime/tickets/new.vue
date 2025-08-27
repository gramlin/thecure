<script setup lang="ts">
const entity = 'tickets'
const baseURL = process.client ? (localStorage.getItem('API_BASE') || 'http://localhost:8000') : ''

const loading = ref(false)
const error = ref<string | null>(null)
const formLayout = ref<{ sections: Array<{ title?: string; fields: string[] }> }>({
  sections: [{ title: 'Ticket Info', fields: ['title', 'description', 'status'] }]
})
const fieldsMeta = ref<Record<string, any>>({
  title: { label: 'Title', type: 'string', required: true },
  description: { label: 'Description', type: 'textarea' },
  status: { label: 'Status', type: 'select', options: [{ label: 'Open', value: 'open' }, { label: 'Closed', value: 'closed' }] }
})

async function handleSubmit(payload: Record<string, any>) {
  try {
    loading.value = true
    const res = await fetch(`${baseURL}/api/${entity}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(await res.text())
    navigateTo(`/runtime/${entity}/list`)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">New Ticket</h2>
          <UButton variant="ghost" to="/runtime/tickets/list">Back to list</UButton>
        </div>
      </template>

      <div v-if="loading" class="py-8"><ULoading /></div>
      <div v-else>
        <DynamicForm :layout="formLayout" :fields-meta="fieldsMeta" @submit="handleSubmit" />
      </div>

      <template #footer>
        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        <p class="text-xs text-gray-500">Set localStorage API_BASE to your backend URL if not localhost:8000</p>
      </template>
    </UCard>
  </div>
</template>
