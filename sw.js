// Este código corre en segundo plano
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'Nuevo Mensaje', body: 'Tienes un nuevo mensaje.' };

    const options = {
        body: data.body,
        icon: 'img/icono home.webp', // Asegúrate de que esta ruta sea correcta
        badge: 'img/icono home.webp',
        vibrate: [100, 50, 100],
        data: { url: 'home.html' }
    };

    event.waitUntil(
        self.notificationPermission === 'granted' && 
        self.registration.showNotification(data.title, options)
    );
});

// Al hacer clic en la notificación, abre la web
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('home.html')
    );
});
