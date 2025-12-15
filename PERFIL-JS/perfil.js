const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";
// 📦 Importar funciones necesarias
import { mostrarNotificacion } from './notificaciones.js';
import { cargarGaleria, setDatosUsuario } from './galeria.js';

// 🧠 Variable global para guardar los datos del usuario
export let datosUsuario = null;

// 🚀 Cargar datos del usuario logueado al inicio
cargarDatosUsuario();

// 🔄 Cargar datos del usuario desde el backend usando la cookie
// Util: formatear fecha ISO a dd-mm-aaaa evitando desajustes de zona horaria
function formatearFechaDMY(fechaISO) {
  if (!fechaISO) return '';
  const d = new Date(fechaISO);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const año = d.getUTCFullYear();
  return `${dia}-${mes}-${año}`;
}

// 🔄 Cargar datos del usuario desde el backend usando la cookie
export async function cargarDatosUsuario() {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/mis-datos`, {
      credentials: "include" // ✅ importante para enviar la cookie
    });
    const data = await res.json();
    console.log("📦 Datos recibidos del backend:", data.usuario);

    if (!data.success) {
      console.error("❌ No se pudo cargar el perfil");
      // Si falla, asegúrate de mostrar la imagen por defecto
      document.getElementById('foto-perfil').src = "/img/usuario-camara.png";
      return null;
    }

    const u = data.usuario;
    datosUsuario = u; // ✅ ACTUALIZAR VARIABLE GLOBAL
    setDatosUsuario(u); // ✅ también actualizar en galeria.js
    console.log("✅ datosUsuario actualizado:", datosUsuario);

    // --- LÓGICA DE IMAGEN DE PERFIL MEJORADA ---
    const fotoPerfilImg = document.getElementById('foto-perfil');
    const placeholderIcon = document.getElementById('placeholder-icon');
    const defaultImgPath = "/img/usuario-camara.png"; // Ruta a tu imagen por defecto

    // Ocultar placeholder por defecto, la lógica decidirá qué mostrar
    if (placeholderIcon) placeholderIcon.classList.add('d-none');
    if (fotoPerfilImg) fotoPerfilImg.classList.remove('d-none');

    // Establecer el manejador de errores
    fotoPerfilImg.onerror = function() {
        console.error(`Perfil: No se pudo cargar la imagen: ${this.src}. Mostrando imagen por defecto.`);
        this.src = defaultImgPath;
        this.onerror = null; // Evitar bucles infinitos
    };

    // Decidir qué imagen mostrar
    // --- LÓGICA DE IMAGEN DE PERFIL MEJORADA ---
   /*const fotoPerfilImg = document.getElementById('foto-perfil');
    const placeholderIcon = document.getElementById('placeholder-icon');
    const defaultImgPath = "/img/usuario-camara.png"; // Ruta a tu imagen por defecto

    // Ocultar placeholder por defecto, la lógica decidirá qué mostrar
    if (placeholderIcon) placeholderIcon.classList.add('d-none');
    if (fotoPerfilImg) fotoPerfilImg.classList.remove('d-none');

    // Establecer el manejador de errores
    fotoPerfilImg.onerror = function() {
        console.error(`Perfil: No se pudo cargar la imagen: ${this.src}. Mostrando imagen por defecto.`);
        this.src = defaultImgPath;
        this.onerror = null; // Evitar bucles infinitos
    };*/

    // Decidir qué imagen mostrar
    if (u.foto_perfil) { // Si hay alguna foto de perfil definida
        if (u.foto_perfil.includes('gravatar.com')) {
            // Si es Gravatar, mostrar la por defecto
            fotoPerfilImg.src = defaultImgPath;
        } else if (u.foto_perfil.startsWith('https://storage.googleapis.com/')) {
            // Si ya es una URL completa de GCS, la usamos directamente
            fotoPerfilImg.src = u.foto_perfil;
        } else {
            // Si es un nombre de archivo antiguo (local) o cualquier otra cosa,
            // construimos la URL con API_URL/uploads/ (por si acaso)
            fotoPerfilImg.src = `${API_URL}/uploads/${u.foto_perfil}`;
        }
    } else {
        // Si no hay foto_perfil definida, mostrar la por defecto
        fotoPerfilImg.src = defaultImgPath;
    }
    // --- FIN DE LÓGICA DE IMAGEN ---

    }
    // --- FIN DE LÓGICA DE IMAGEN ---

    // Mostrar el resto de los datos en pantalla
    document.getElementById('nombre').textContent = u.nombre || '';
    document.getElementById('fecha-nac').textContent = formatearFechaDMY(u.fecha_nac);
    document.getElementById('nacionalidad').textContent = u.nacionalidad || '';
    document.getElementById('email').textContent = u.email || '';
    document.getElementById('usuario').textContent = u.usuario || '';
    // El campo de contraseña no se muestra por seguridad, lo cual es correcto.

    // 🔄 Cargar galería del usuario (importada desde galeria.js)
    cargarGaleria(u.id);

    return u;
  } catch (error) {
    console.error("❌ Error al conectar con el servidor", error);
    // En caso de error, también mostrar la imagen por defecto
    const fotoPerfilImg = document.getElementById('foto-perfil');
    if(fotoPerfilImg) fotoPerfilImg.src = "/img/usuario-camara.png";
    return null;
  }
}


// 📤 Enviar imagen al backend
// 📤 Enviar imagen al backend
export async function enviarImagenAlBackend(imagenBlob) {
  try {
    const formData = new FormData();
    formData.append('foto', imagenBlob, 'archivo.jpg');

    console.log("📤 FormData enviado:", [...formData.entries()]);

    const res = await fetch(`${API_URL}/api/usuarios/foto`, {
      method: 'POST',
      body: formData,
      credentials: "include"
    });

    const data = await res.json();
    console.log("📥 Respuesta del backend:", data);

    if (data.success) {
      mostrarNotificacion('✅ Imagen de perfil actualizada');

      // --- LÓGICA MEJORADA PARA ACTUALIZAR IMAGEN ---
      // data.url ya es la URL completa de GCS, la usamos directamente
      const timestamp = new Date().getTime();
      const nuevaRuta = `${data.url}?t=${timestamp}`; // <-- CORRECCIÓN AQUÍ: ELIMINAMOS API_URL

      const imagen = document.getElementById('foto-perfil');
      if (imagen) imagen.src = nuevaRuta;

      // Actualizar el objeto local 'datosUsuario' si es necesario
      if (datosUsuario) {
        // Almacenamos la URL completa de GCS, ya que es lo que el backend devuelve ahora
        datosUsuario.foto_perfil = data.url; 
      }
      
    } else {
      mostrarNotificacion(data.message || '❌ No se pudo actualizar la imagen');
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al enviar imagen');
    console.error(error);
  }
}










