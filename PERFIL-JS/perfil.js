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

export async function cargarDatosUsuario() {
  try {
    const res = await fetch("http://localhost:3000/api/usuarios/mis-datos", {
      credentials: "include" // ✅ importante para enviar la cookie
    });
    const data = await res.json();
    console.log("📦 Datos recibidos del backend:", data.usuario);

    if (!data.success) {
      console.error("❌ No se pudo cargar el perfil");
      return null;
    }

    const u = data.usuario;
    datosUsuario = u; // ✅ ACTUALIZAR VARIABLE GLOBAL
    setDatosUsuario(u); // ✅ también actualizar en galeria.js
    console.log("✅ datosUsuario actualizado:", datosUsuario);

    // Mostrar en pantalla
    document.getElementById('nombre').textContent = u.nombre || '';
    document.getElementById('fecha-nac').textContent = formatearFechaDMY(u.fecha_nac);
    document.getElementById('nacionalidad').textContent = u.nacionalidad || '';
    document.getElementById('email').textContent = u.email || '';
    document.getElementById('usuario').textContent = u.usuario || '';
    document.getElementById('password').textContent = u.password || '';

    if (u.foto_perfil) {
      document.getElementById('foto-perfil').src = `http://localhost:3000/uploads/${u.foto_perfil}`;
      document.getElementById('foto-perfil').classList.remove('d-none');
      document.getElementById('placeholder-icon').classList.add('d-none');
    }

    // 🔄 Cargar galería del usuario (importada desde galeria.js)
    cargarGaleria(u.id);

    return u;
  } catch (error) {
    console.error("❌ Error al conectar con el servidor", error);
    return null;
  }
}


// 📤 Enviar imagen al backend
export async function enviarImagenAlBackend(imagenBlob) {
  try {
    const formData = new FormData();
    // 👇 nombre del campo correcto para multer
    formData.append('foto', imagenBlob, 'archivo.jpg');

    console.log("📤 FormData enviado:", [...formData.entries()]);

    const res = await fetch("http://localhost:3000/api/usuarios/foto", {
      method: 'POST',
      body: formData,
      credentials: "include" // 👈 importante para que viaje la cookie
    });

    const data = await res.json();
    console.log("📥 Respuesta del backend:", data);

    if (data.success) {
      mostrarNotificacion('✅ Imagen de perfil actualizada');

      // Recargar datos del usuario
      const nuevosDatos = await cargarDatosUsuario();
      datosUsuario = nuevosDatos;

      // Evitar caché al mostrar la nueva imagen
      const timestamp = new Date().getTime();
      const nuevaRuta = `http://localhost:3000/uploads/${datosUsuario.foto_perfil}?t=${timestamp}`;
      const imagen = document.getElementById('foto-perfil');
      if (imagen) imagen.src = nuevaRuta;
    } else {
      mostrarNotificacion('❌ No se pudo actualizar la imagen');
    }
  } catch (error) {
    mostrarNotificacion('❌ Error al enviar imagen');
    console.error(error);
  }
}


