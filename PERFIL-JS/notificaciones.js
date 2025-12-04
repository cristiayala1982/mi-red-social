export const mostrarNotificacion = mensaje => {
  const notificacion = document.getElementById('notificacion-flotante');
  notificacion.textContent = mensaje;
  notificacion.classList.remove('d-none');
  setTimeout(() => {
    notificacion.classList.add('d-none');
  }, 3000);
};
