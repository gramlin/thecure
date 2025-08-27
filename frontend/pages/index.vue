<template>
  <div class="p-6">
    <UCard>
      <h1 class="text-2xl font-semibold">Codeless Platform</h1>
      <p class="mt-2">Nuxt 4 + Nuxt UI starter running.</p>
      <div class="mt-4 flex gap-3">
        <UButton to="/admin/apps" color="primary" variant="solid">Admin Studio</UButton>
        <UButton to="/runtime/tickets/list" variant="soft">Tickets (Demo)</UButton>
      </div>
      <p class="mt-4 text-xs text-gray-500">
        Tip: set your backend base URL in localStorage:
        <code>localStorage.setItem('API_BASE','http://localhost:8000')</code>
      </p>
    </UCard>
  </div>
</template>
