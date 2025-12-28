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
      credentials: "include"
    });

    const data = await res.json();
    console.log("📦 Respuesta de /mis-datos:", data);

    if (data.success && data.usuario) {
      datosUsuario = data.usuario;
      usuarioId = datosUsuario.id;
      console.log("✅ Usuario cargado:", datosUsuario.nombre);

      // Mostrar foto de perfil con validación
      const navFoto = document.getElementById("nav-foto-perfil");
      const defaultImgPath = "/img/usuario-camara.png";

      if (navFoto) {
        navFoto.onerror = function() {
          console.error(`Navbar: No se pudo cargar la imagen: ${this.src}. Mostrando imagen por defecto.`);
          this.src = defaultImgPath;
          this.onerror = null;
        };

        if (datosUsuario.foto_perfil && datosUsuario.foto_perfil.startsWith("http")) {
          navFoto.src = `${datosUsuario.foto_perfil}?t=${Date.now()}`;
        } else {
          navFoto.src = defaultImgPath;
        }
      }

      const bienvenida = document.getElementById("bienvenida");
      if (bienvenida) {
        bienvenida.textContent = `Hola ${datosUsuario.nombre} 👋`;
      }
    } else {
      console.warn("⚠️ No autenticado, navbar vacío");
      const navFoto = document.getElementById("nav-foto-perfil");
      if (navFoto) {
        navFoto.src = "/img/usuario-camara.png";
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar datos del usuario", error);
    const navFoto = document.getElementById("nav-foto-perfil");
    if (navFoto) {
      navFoto.src = "/img/usuario-camara.png";
    }
  }
}

// 👉 Actualizar badge de mensajes no leídos
export async function actualizarBadgeMensajes() {
  try {
    const res = await fetch(`${API_URL}/api/chats/noLeidos/count`, { credentials: "include" });
    const data = await res.json();

    const navbarBadge = document.getElementById("badge-mensajes");
    const panelBadge = document.getElementById("contador-mensajes");

    const total = data.success ? data.total : 0;

    if (navbarBadge) {
      navbarBadge.textContent = total > 0 ? String(total) : "";
      navbarBadge.classList.toggle("oculto", total === 0);
    }

    if (panelBadge) {
      panelBadge.textContent = total > 0 ? String(total) : "";
      panelBadge.classList.toggle("oculto", total === 0);
    }
  } catch (error) {
    console.error("❌ Error al actualizar badge:", error);
  }
}





// 🚀 Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    cargarDatosNavbar();
    actualizarBadgeMensajes();
  }, 300);

  setInterval(actualizarBadgeMensajes, 5000);

  // 🔍 Buscador en móvil
  const btnAbrir = document.getElementById('btn-abrir-busqueda');
  const btnCerrar = document.querySelector('.btn-cerrar-busqueda');
  const buscador = document.querySelector('.buscador-usuarios');

  if (btnAbrir && btnCerrar && buscador) {
    btnAbrir.addEventListener('click', () => {
      buscador.classList.add('active');
      document.getElementById('input-busqueda').focus();
    });

    btnCerrar.addEventListener('click', () => {
      buscador.classList.remove('active');
    });
  }

  // 👤 Menú de perfil en móvil (click)
  const perfilIcono = document.getElementById('nav-foto-perfil');
  const dropdown = document.querySelector('.perfil-menu .dropdown-menu');

  if (perfilIcono && dropdown) {
    perfilIcono.addEventListener('click', (e) => {
      e.stopPropagation();
      const visible = dropdown.style.display === 'block';
      dropdown.style.display = visible ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!perfilIcono.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
});



























