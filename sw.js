const CACHE_NAME = 'remusic-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/icons/icon-192x192.png',
    '/static/icons/icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        $.Deferred().resolve()
            .then(() => caches.open(CACHE_NAME))
            .then((cache) => {
                console.log('Кэш открыт');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        $.Deferred().resolve()
            .then(() => caches.keys())
            .then((cacheNames) => {
                return $.when.apply($, cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                }));
            })
    );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
    event.respondWith(
        $.Deferred().resolve()
            .then(() => caches.match(event.request))
            .then((response) => {
                if (response) {
                    return response;
                }

                return $.ajax({
                    url: event.request.url,
                    method: event.request.method,
                    headers: event.request.headers,
                    body: event.request.body
                }).then((response) => {
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/static/icons/icon-192x192.png',
        badge: '/static/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Открыть',
                icon: '/static/icons/icon-192x192.png'
            }
        ]
    };

    event.waitUntil(
        $.Deferred().resolve()
            .then(() => self.registration.showNotification('ReMusic', options))
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            $.Deferred().resolve()
                .then(() => clients.openWindow('/'))
        );
    }
});