const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";
// 📦 Importar funciones necesarias
import { mostrarNotificacion } from './notificaciones.js';
import { cargarGaleria, setDatosUsuario } from './galeria.js';
import { cargarDatosNavbar } from '../HOME_JS/navbar.js';



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
export async function cargarDatosUsuario() {
  try {
    const res = await fetch(`${API_URL}/api/usuarios/mis-datos`, {
      credentials: "include" // ✅ importante para enviar la cookie
    });
    const data = await res.json();
    console.log("📦 Datos recibidos del backend:", data.usuario);

    if (!data.success) {
      console.error("❌ No se pudo cargar el perfil");
      document.getElementById('foto-perfil').src = "/img/usuario-camara.png";
      return null;
    }

    const u = data.usuario;
    datosUsuario = u; 
    setDatosUsuario(u); 
    console.log("✅ datosUsuario actualizado:", datosUsuario);

    // --- LÓGICA DE IMAGEN DE PERFIL SIMPLIFICADA ---
    const fotoPerfilImg = document.getElementById('foto-perfil');
    const placeholderIcon = document.getElementById('placeholder-icon');
    const defaultImgPath = "/img/usuario-camara.png";

    if (placeholderIcon) placeholderIcon.classList.add('d-none');
    if (fotoPerfilImg) fotoPerfilImg.classList.remove('d-none');

    fotoPerfilImg.onerror = function() {
      console.error(`Perfil: No se pudo cargar la imagen: ${this.src}. Mostrando imagen por defecto.`);
      this.src = defaultImgPath;
      this.onerror = null;
    };

    // ✅ Ahora siempre guardamos URL completa en la DB, así que usamos directamente esa URL
    if (u.foto_perfil && u.foto_perfil.startsWith("http")) {
      fotoPerfilImg.src = u.foto_perfil;
    } else {
      fotoPerfilImg.src = defaultImgPath;
    }
    // --- FIN DE LÓGICA DE IMAGEN ---

    // Mostrar el resto de los datos en pantalla
    document.getElementById('nombre').textContent = u.nombre || '';
    document.getElementById('fecha-nac').textContent = formatearFechaDMY(u.fecha_nac);
    document.getElementById('nacionalidad').textContent = u.nacionalidad || '';
    document.getElementById('email').textContent = u.email || '';
    document.getElementById('usuario').textContent = u.usuario || '';

    // 🔄 Cargar galería del usuario
    cargarGaleria(u.id);

    return u;
  } catch (error) {
    console.error("❌ Error al conectar con el servidor", error);
    const fotoPerfilImg = document.getElementById('foto-perfil');
    if (fotoPerfilImg) fotoPerfilImg.src = "/img/usuario-camara.png";
    return null;
  }
}

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
      const nuevaRuta = `${data.url}?t=${timestamp}`; 

      const imagen = document.getElementById('foto-perfil');
      if (imagen) imagen.src = nuevaRuta;

      // Actualizar el objeto local 'datosUsuario' si es necesario
      if (datosUsuario) {
        // Almacenamos la URL completa de GCS, ya que es lo que el backend devuelve ahora
        datosUsuario.foto_perfil = data.url; 
      }
      
      // 👇 ¡ESTA ES LA LÍNEA QUE DEBES AGREGAR AQUÍ! 👇
      cargarGaleria(); 
      cargarDatosNavbar();
      // ------------------------------------------------------------------
      
    } else {
      mostrarNotificacion(data.message || '❌ No se pudo actualizar la imagen');
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al enviar imagen');
    console.error(error);
  }
}

//ELIMINAR TODOS LOS DATOS DEL USUARIO
// perfil.js
export function configurarEliminarUsuario() {
  const btnEliminar = document.getElementById("eliminar-usuario");
  if (!btnEliminar) {
    console.error("❌ No se encontró el botón eliminar-usuario en el DOM");
    return;
  }

  btnEliminar.addEventListener("click", async () => {
    console.log("Botón clickeado"); // debug
    if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`${API_URL}/api/usuario/eliminar`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ Tu cuenta fue eliminada correctamente.");
        window.location.href = "index.html";
      } else {
        alert(`⚠️ Error: ${data.message}`);
      }
    } catch (err) {
      console.error("❌ Error al eliminar usuario:", err);
      alert("❌ No se pudo eliminar tu cuenta. Intenta de nuevo.");
    }
  });
}























