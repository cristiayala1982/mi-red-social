// 📦 Importar función para mostrar notificaciones
import { mostrarNotificacion } from './notificaciones.js';

// 🧠 Variable local para guardar los datos del usuario
let datosUsuario = null;
export function setDatosUsuario(datos) {
  datosUsuario = datos;
}

// 🗓️ Función para mostrar fecha relativa + exacta
function tiempoRelativo(fechaISO) {
  if (!fechaISO) return 'sin fecha';

  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);
  const diffDias = Math.floor(diffHoras / 24);

  const formatoFecha = fecha.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  let relativo;

  if (diffMin < 1) relativo = 'hace segundos';
  else if (diffMin < 60) relativo = `hace ${diffMin} min`;
  else if (diffHoras < 24) relativo = `hace ${diffHoras} h`;
  else if (diffDias === 1) relativo = 'ayer';
  else if (diffDias < 7) relativo = `hace ${diffDias} días`;
  else relativo = ` ${formatoFecha}`; // 👈 solo fecha, sin duplicar

  return relativo;
}


// 📦 Cargar galería del usuario
// 📦 Cargar galería del usuario autenticado (cookie)
export async function cargarGaleria() {
  try {
    const res = await fetch("http://localhost:3000/api/usuarios/galeria", {
      credentials: "include"
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    console.log("📦 Galería recibida:", data);

    const galeria = document.getElementById("galeria-fotos");
    if (!galeria) return;

    galeria.innerHTML = "";

    if (data.success && Array.isArray(data.galeria)) {
      data.galeria.forEach(imagen => {
        const col = document.createElement("div");
        col.className = "col";

        const filename = imagen.url.split('/').pop();
        const fechaTexto = tiempoRelativo(imagen.fecha_subida);

        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${imagen.url}" class="imagen-galeria card-img-top" alt="Foto de galería">
            <div class="card-body text-center d-flex flex-column gap-2">
              <p class="text-muted mb-1">📅 ${fechaTexto}</p>
              <button class="btn btn-outline-primary btn-sm usar-btn">Usar como foto de perfil</button>
              <button class="btn btn-outline-danger btn-sm eliminar-btn">Eliminar</button>
            </div>
          </div>
        `;

        // 🗑️ Botón eliminar
        const btnEliminar = col.querySelector('.eliminar-btn');
        btnEliminar.onclick = () => {
          const tarjeta = btnEliminar.closest('.col');
          mostrarConfirmacion(() => eliminarImagen(imagen.id, tarjeta));
        };

        // 👤 Botón usar como foto de perfil
        const btnUsar = col.querySelector('.usar-btn');
        btnUsar.onclick = () => {
          usarComoFotoDePerfil(filename);
        };

        galeria.appendChild(col);
      });
    } else {
      galeria.innerHTML = "<p>No hay imágenes en la galería</p>";
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al cargar la galería');
    console.error(error);
    const galeria = document.getElementById("galeria-fotos");
    if (galeria) galeria.innerHTML = "<p>Error al cargar la galería</p>";
  }
}


// ⚠️ Confirmación antes de eliminar (abre modal Bootstrap)
function mostrarConfirmacion(callback) {
  const modal = new bootstrap.Modal(document.getElementById('modalConfirmacion'));
  modal.show();

  const btnConfirmar = document.getElementById('btnConfirmarEliminar');
  btnConfirmar.onclick = () => {
    callback();
    modal.hide();
  };
}

// 🗑️ Eliminar imagen de la galería (API DELETE)
async function eliminarImagen(idImagen, elemento) {
  try {
    const res = await fetch(`http://localhost:3000/api/galeria/${idImagen}`, {
      method: 'DELETE',
      credentials: "include"
    });

    if (res.ok) {
      elemento.remove();
      mostrarNotificacion('✅ Imagen eliminada');
    } else {
      mostrarNotificacion('❌ No se pudo eliminar la imagen');
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al eliminar imagen');
    console.error(error);
  }
}

// 👤 Usar imagen como foto de perfil y actualizar vista
async function usarComoFotoDePerfil(nombreArchivo) {
  try {
    const formData = new FormData();
    formData.append('foto_perfil', nombreArchivo);

    formData.append('nombre', datosUsuario.nombre);
    formData.append('fecha-nac', datosUsuario.fecha_nac);
    formData.append('nacionalidad', datosUsuario.nacionalidad);
    formData.append('email', datosUsuario.email);
    formData.append('usuario', datosUsuario.usuario);
    formData.append('password', datosUsuario.password);

    const res = await fetch(`http://localhost:3000/api/usuario/editar-perfil`, {
      method: 'POST',
      body: formData,
      credentials: "include"
    });

    if (res.ok) {
      mostrarNotificacion('✅ Foto de perfil actualizada');

      const timestamp = new Date().getTime();
      const nuevaRuta = `http://localhost:3000/uploads/${nombreArchivo}?t=${timestamp}`;
      const imagen = document.getElementById('foto-perfil');
      const placeholder = document.getElementById('placeholder-icon');
      if (imagen) {
        imagen.src = nuevaRuta;
        imagen.classList.remove('d-none');
        placeholder.classList.add('d-none');
      }
    } else {
      mostrarNotificacion('❌ No se pudo actualizar la foto de perfil');
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al actualizar foto de perfil');
    console.error(error);
  }
}


