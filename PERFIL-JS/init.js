
import { mostrarNotificacion } from './notificaciones.js';
import { cargarDatosUsuario } from './perfil.js';
import { cargarGaleria, setDatosUsuario } from './galeria.js';
import { configurarSubidaImagen } from './subirImagen.js';
import { configurarImagenPerfil } from './selfieImagen.js';
import { configurarSelfieCamara } from './selfieCamara.js';
const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";
document.addEventListener('DOMContentLoaded', async () => {
  mostrarNotificacion('✅ init.js está funcionando');

  try {
    // 🔄 Cargar datos del usuario desde el backend (cookie)
    const datos = await cargarDatosUsuario(); // 👈 ya no pasamos idUsuario
    if (datos) {
      setDatosUsuario(datos); // Pasar datos a galeria.js si lo usás

      // 🖼 Cargar galería de fotos
      cargarGaleria(datos.id);

      // 📤 Configurar subida de imagen a galería
      configurarSubidaImagen(datos.id);
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al cargar datos del usuario');
    console.error(error);
  }

  // 📸 Configurar imagen de perfil desde archivo
  configurarImagenPerfil();

  // 🤳 Configurar cámara para selfie
  configurarSelfieCamara();

  // 🔍 Buscador de usuarios (solo si existe en el HTML)
  const formBusqueda = document.getElementById('form-busqueda');
  const inputBusqueda = document.getElementById('input-busqueda');

  if (formBusqueda && inputBusqueda) {
    formBusqueda.addEventListener('submit', async e => {
      e.preventDefault();
      const query = inputBusqueda.value.trim();
      if (!query) return;

      try {
        const res = await fetch(`${API_URL}/api/usuarios/buscar?nombre=${encodeURIComponent(query)}`, {
          credentials: "include" // 👈 importante para que viaje la cookie
        });
        const data = await res.json();

        if (data.success && data.resultados.length > 0) {
          console.log('👤 Usuarios encontrados:', data.resultados);
        } else {
          console.log('⚠️ No se encontraron usuarios');
        }
      } catch (error) {
        console.error('❌ Error al buscar usuarios', error);
      }
    });
  }
});



