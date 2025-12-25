import { mostrarNotificacion } from './notificaciones.js';
//import { cargarDatosUsuario } from './perfil.js';
import { cargarDatosUsuario, configurarEliminarUsuario } from './perfil.js';
import { cargarGaleria, setDatosUsuario } from './galeria.js';
import { configurarSubidaImagen } from './subirImagen.js';
import { configurarImagenPerfil } from './selfieImagen.js';
import { configurarSelfieCamara } from './selfieCamara.js';
const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";
document.addEventListener('DOMContentLoaded', async () => {
  mostrarNotificacion('✅ init.js está funcionando');

 /* try {
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

  // 👇 ESTA LÍNEA FALTABA 
  configurarEliminarUsuario();

  document.addEventListener('DOMContentLoaded', async () => {
  mostrarNotificacion('✅ init.js está funcionando');*/

  try {
    const datos = await cargarDatosUsuario();
    if (datos) {
      setDatosUsuario(datos);
      cargarGaleria(datos.id);
      configurarSubidaImagen(datos.id);
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al cargar datos del usuario');
    console.error(error);
  }

  configurarImagenPerfil();
  configurarSelfieCamara();

  // 👇 ESTA LÍNEA FALTABA
  configurarEliminarUsuario();
});









