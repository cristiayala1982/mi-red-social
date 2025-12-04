import { mostrarNotificacion } from './notificaciones.js';
import { cargarGaleria } from './galeria.js';

export const configurarSubidaImagen = () => {
  const inputGaleria = document.getElementById('input-galeria');
  const btnSubir = document.getElementById('btn-subir-galeria');
  const mensajeSubida = document.getElementById('mensaje-subida');

  btnSubir.onclick = async () => {
    const archivo = inputGaleria.files[0];
    if (!archivo) {
      mostrarNotificacion('⚠️ Seleccioná una imagen primero');
      return;
    }

    const formData = new FormData();
    // 👇 nombre del campo correcto para el endpoint de galería
    formData.append('imagen', archivo);

    try {
      const res = await fetch("http://localhost:3000/api/usuarios/galeria", {
        method: 'POST',
        body: formData,
        credentials: "include" // 👈 importante para que viaje la cookie
      });

      if (res.ok) {
        mensajeSubida.classList.remove('d-none');
        mostrarNotificacion('✅ Imagen subida a la galería');
        // ya no hace falta pasar idUsuario, la cookie lo resuelve
        cargarGaleria();
        inputGaleria.value = ''; // limpiar input
      } else {
        mostrarNotificacion('❌ No se pudo subir la imagen');
      }
    } catch (error) {
      mostrarNotificacion('❌ Error al subir imagen');
      console.error(error);
    }
  };
};

