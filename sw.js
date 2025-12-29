// sw.js - Manejador de mensajes en segundo plano
self.addEventListener('push', function(event) {
    const options = {
        body: 'Tienes un nuevo mensaje en la red social',
        icon: 'img/icono home.webp',
        badge: 'img/icono home.webp'
    };

    event.waitUntil(
        self.registration.showNotification('Nuevo Mensaje', options)
    );
});

// Al hacer clic en la notificación, abre la web
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('home.html')
    );
});
