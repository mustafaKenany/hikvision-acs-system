// Hikvision ACS - Service Worker for Push Notifications
// نسخة: 1.0.0

const CACHE_NAME = 'hikvision-acs-v1'

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...')
  self.skipWaiting()
})

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(clients.claim())
})

// استقبال الإشعارات من السيرفر
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received')
  
  if (!event.data) {
    console.log('[Service Worker] No data in push event')
    return
  }

  let data
  try {
    data = event.data.json()
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error)
    data = {
      title: 'Hikvision ACS',
      body: event.data.text() || 'إشعار جديد'
    }
  }

  const options = {
    body: data.body || 'لديك إشعار جديد',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: data.image,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      ...data.data
    },
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      { action: 'open', title: 'عرض', icon: '/icons/view.png' },
      { action: 'close', title: 'إغلاق', icon: '/icons/close.png' }
    ],
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'ar'
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Hikvision ACS', options)
  )
})

// عند النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action)
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // البحث عن نافذة مفتوحة
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(urlToOpen)
            return
          }
        }
        
        // فتح نافذة جديدة إذا لم توجد
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// إغلاق الإشعار
self.addEventListener('notificationclose', (event) => {
  console.log('[Service Worker] Notification closed:', event.notification.tag)
})

console.log('[Service Worker] Loaded successfully')
