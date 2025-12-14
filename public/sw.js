const CACHE_NAME = 'pixel-client-cache-v1'
const ASSETS = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return

  // Skip caching for non-http(s) schemes (e.g. chrome-extension://)
  try {
    const reqUrl = new URL(event.request.url)
    if (reqUrl.protocol !== 'http:' && reqUrl.protocol !== 'https:') {
      // Fall back to network for unsupported schemes
      event.respondWith(fetch(event.request))
      return
    }
  } catch (e) {
    // If URL parsing fails, just fallback to network
    event.respondWith(fetch(event.request))
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request)
        .then((response) => {
          // Only cache successful (200) responses from http/https
          if (!response || response.status !== 200) return response
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(() => cached || fetch(event.request))
    })
  )
})
