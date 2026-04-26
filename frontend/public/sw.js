// Service Worker for Pathways PWA
// Handles caching and offline support

const CACHE_NAME = 'pathways-v1'

// Files to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
]

// Install event, cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_ASSETS)
        })
    )
    self.skipWaiting()
})

// Activate event, clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
        return Promise.all(
            keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
        })
    )
    self.clients.claim()
})

// Fetch event, serve from cache when offline
// Network first strategy, try network, fall back to cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
        .then(response => {
            // Clone the response and store in cache
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone)
            })
            return response
        })
        .catch(() => {
            // Network failed — try cache
            return caches.match(event.request)
        })
    )
})