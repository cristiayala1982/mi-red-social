import { mostrarNotificacion } from './notificaciones.js';
import { mostrarConfirmacion } from './confirmacion.js';
import { enviarImagenAlBackend } from './perfil.js';

export const configurarImagenPerfil = () => {
  const inputImagen = document.getElementById('input-imagen');
  const btnUsarImagen = document.getElementById('btn-usar-imagen');
  const mensajeImagen = document.getElementById('mensaje-imagen');
  const fotoPerfil = document.getElementById('foto-perfil');
  const placeholderIcon = document.getElementById('placeholder-icon');

  let imagenSeleccionada = null;

  inputImagen.onchange = () => {
    const archivo = inputImagen.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = e => {
      fotoPerfil.src = e.target.result;
      fotoPerfil.classList.remove('d-none');
      placeholderIcon.classList.add('d-none');
      btnUsarImagen.classList.remove('d-none');
      mensajeImagen.classList.remove('d-none');
      imagenSeleccionada = archivo;
    };
    lector.readAsDataURL(archivo);
  };

  btnUsarImagen.onclick = () => {
    mostrarConfirmacion(() => {
      enviarImagenAlBackend(imagenSeleccionada);
      btnUsarImagen.classList.add('d-none');
      mensajeImagen.classList.add('d-none');
    });
  };
};