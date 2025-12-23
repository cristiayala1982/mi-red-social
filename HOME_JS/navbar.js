const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";
let usuarioId = null;
export let datosUsuario = null;

// 👉 función para obtener siempre el usuarioId actualizado
export function getUsuarioId() {
  return usuarioId;
}

// 🔄 Cargar foto y nombre de perfil en la navbar
export async function cargarDatosNavbar() {
  console.log("🔍 Llamando a /mis-datos con cookie...");

  try {
    const res = await fetch(`${API_URL}/api/usuarios/mis-datos`, {
      method: "GET",
      credentials: "include" // 👈 manda la cookie automáticamente
    });

    const data = await res.json();
    console.log("📦 Respuesta de /mis-datos:", data);

    if (data.success && data.usuario) {
      datosUsuario = data.usuario;       // guarda todo el objeto
      usuarioId = datosUsuario.id;       // guarda solo el id para comparaciones rápidas
      console.log("✅ Usuario cargado:", datosUsuario.nombre);

      // Mostrar foto de perfil con validación
      const navFoto = document.getElementById("nav-foto-perfil");
      const defaultImgPath = "/img/usuario-camara.png"; // Ruta a tu imagen por defecto

      if (navFoto) {
        // Establecer el manejador onerror UNA SOLA VEZ
        navFoto.onerror = function() {
          console.error(`Navbar: No se pudo cargar la imagen: ${this.src}. Mostrando imagen por defecto.`);
          this.src = defaultImgPath;
          this.onerror = null; // Evitar bucles infinitos
        };

        // --- LÓGICA MEJORADA PARA IMAGEN DE PERFIL EN NAVBAR ---
        if (datosUsuario.foto_perfil && datosUsuario.foto_perfil.startsWith("http")) {
          // ✅ Siempre guardamos URL completa en la DB, la usamos directamente
          navFoto.src = `${datosUsuario.foto_perfil}?t=${Date.now()}`;
        } else {
          // Si no hay foto válida, mostramos la imagen por defecto
          navFoto.src = defaultImgPath;
        }
      }

      // Mostrar saludo en el home (si existe)
      const bienvenida = document.getElementById("bienvenida");
      if (bienvenida) {
        bienvenida.textContent = `Hola ${datosUsuario.nombre} 👋`;
      }
    } else {
      console.warn("⚠️ No autenticado, navbar vacío (no se redirige)");
      // Si no hay usuario autenticado, asegurar que la imagen de la navbar sea la por defecto
      const navFoto = document.getElementById("nav-foto-perfil");
      if (navFoto) {
        navFoto.src = "/img/usuario-camara.png";
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar datos del usuario", error);
    console.warn("⚠️ No se pudieron cargar datos, navbar vacío");
    // En caso de error, asegurar que la imagen de la navbar sea la por defecto
    const navFoto = document.getElementById("nav-foto-perfil");
    if (navFoto) {
      navFoto.src = "/img/usuario-camara.png";
    }
  }
}

// 🚀 Ejecutar al cargar la página con delay
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    cargarDatosNavbar();
  }, 300); // ⏱ espera 300ms para que la cookie esté lista
});
// 👉 Actualizar badge de mensajes no leídos
export async function actualizarBadgeMensajes() {
  try {
    const res = await fetch(`${API_URL}/api/chats/noLeidos/count`, {
      credentials: "include"
    });
    const data = await res.json();

    const badge = document.getElementById("badge-mensajes");
    if (!badge) return;

    if (data.success && data.total > 0) {
      badge.textContent = data.total;
      badge.classList.remove("oculto");

      // animación suave para que se note el cambio
      badge.classList.add("updated");
      setTimeout(() => badge.classList.remove("updated"), 300);
    } else {
      badge.classList.add("oculto");
    }
  } catch (error) {
    console.error("❌ Error al actualizar badge:", error);
  }
}


// 🚀 Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    cargarDatosNavbar();
    actualizarBadgeMensajes(); // refresca badge al cargar
  }, 300);

  // refrescar cada 30 segundos
  setInterval(actualizarBadgeMensajes, 5000);
});
























