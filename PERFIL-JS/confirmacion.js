import { mostrarNotificacion } from './notificaciones.js';

export const mostrarConfirmacion = callback => {
  const confirmacion = document.getElementById('confirmacion-accion');
  const btnSi = document.getElementById('btn-confirmar-si');
  const btnNo = document.getElementById('btn-confirmar-no');

  confirmacion.classList.remove('d-none');

  btnSi.onclick = () => {
    confirmacion.classList.add('d-none');
    callback();
  };

  btnNo.onclick = () => {
    confirmacion.classList.add('d-none');
    mostrarNotificacion('❌ Acción cancelada');
  };
};