const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";

// Util: formatear fecha ISO a dd-mm-aaaa evitando desajustes de zona horaria
function formatearFechaDMY(fechaISO) {
  if (!fechaISO) return '';
  const d = new Date(fechaISO);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  const año = d.getUTCFullYear();
  return `${dia}-${mes}-${año}`;
}

// 🚀 Cargar datos del usuario logueado en el nav
async function cargarNavUsuario() {
  try {
    const res = await fetch(`${API_URL}/api/usuario/perfil`, {
      credentials: "include"
    });
    const data = await res.json();

    if (data.success && data.usuario) {
      const u = data.usuario;

      const navImg = document.getElementById("nav-foto-perfil");
      if (navImg) {
        if (u.foto_perfil && u.foto_perfil.startsWith("http")) {
          navImg.src = u.foto_perfil;
        } else {
          navImg.src = "img/usuario-camara.png";
        }
      }

      const nombreSpan = document.getElementById("nav-nombre-usuario");
      if (nombreSpan) {
        nombreSpan.textContent = u.nombre || "Usuario";
      }
    }
  } catch (err) {
    console.error("❌ Error al cargar usuario en nav:", err);
  }
}

cargarNavUsuario();

// 🔄 Obtener ID desde la URL OTRO PERFIL
function obtenerIdVisitado() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

const idVisitado = obtenerIdVisitado();
console.log("🔍 Visitando perfil de ID:", idVisitado);

if (!idVisitado) {
  const msg = document.querySelector(".mensaje-perfil");
  if (msg) msg.textContent = "No se encontró el perfil solicitado.";
} else {
  cargarDatosUsuario(idVisitado);
}

// 🚀 Cargar datos y galería del usuario visitado
async function cargarDatosUsuario(id) {
  try {
    const res = await fetch(`${API_URL}/api/usuario/perfil?id=${id}`, {
      credentials: "include"
    });
    const data = await res.json();

    if (!data.success || !data.usuario) {
      console.warn("⚠️ No se encontró el usuario");
      return;
    }

    const u = data.usuario;
    console.log("📦 Datos del usuario visitado:", u);

    // Mostrar datos en pantalla
    const nombreEl = document.getElementById("nombre");
    const emailEl = document.getElementById("email");
    const fechaEl = document.getElementById("fecha-nac");
    const nacEl = document.getElementById("nacionalidad");
    const nombreVisitadoEl = document.getElementById("nombre-visitado");
    const fotoEl = document.getElementById("foto-perfil");

    if (nombreVisitadoEl) nombreVisitadoEl.textContent = u.nombre || "";
    if (nombreEl) nombreEl.textContent = u.nombre || "";
    if (emailEl) emailEl.textContent = u.email || "";
    if (fechaEl) fechaEl.textContent = formatearFechaDMY(u.fecha_nac);
    if (nacEl) nacEl.textContent = u.nacionalidad || "";

    if (fotoEl) {
      if (u.foto_perfil && u.foto_perfil.startsWith("http")) {
        fotoEl.src = u.foto_perfil;
      } else {
        fotoEl.src = "img/usuario-camara.png";
      }
    }

    // Galería
    const contenedor = document.getElementById("galeria");
    if (contenedor) {
      contenedor.innerHTML = "";

      if (Array.isArray(data.galeria) && data.galeria.length > 0) {
        data.galeria.forEach(img => {
          const contenedorImg = document.createElement("div");
          contenedorImg.classList.add("item-galeria");

          const elemento = document.createElement("img");
          elemento.src = img.url && img.url.startsWith("http") ? img.url : "img/usuario-camara.png";
          elemento.alt = "Imagen de galería";
          elemento.classList.add("imagen-galeria");

          const fecha = document.createElement("small");
          fecha.classList.add("fecha-imagen");
          fecha.textContent = formatearFechaDMY(img.fecha_subida);

          contenedorImg.appendChild(elemento);
          contenedorImg.appendChild(fecha);
          contenedor.appendChild(contenedorImg);
        });
      } else {
        contenedor.innerHTML = "<p>No hay imágenes en la galería</p>";
      }
    }
  } catch (error) {
    console.error("❌ Error al cargar perfil:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const perfilId = Number(params.get("id"));

  // Usuario logueado
  const meRes = await fetch(`${API_URL}/api/usuarios/mis-datos`, { credentials: "include" });
  const meData = await meRes.json();
  const yoId = meData?.usuario?.id;

  // Datos del perfil visitado (ya se cargan en cargarDatosUsuario, esto mantiene nombre/email sincronizados)
  const perfilRes = await fetch(`${API_URL}/api/usuario/perfil?id=${perfilId}`, { credentials: "include" });
  const perfilData = await perfilRes.json();
  const perfil = perfilData?.usuario;

  const nombreVisitadoEl = document.getElementById("nombre-visitado");
  const nombreEl = document.getElementById("nombre");
  const emailEl = document.getElementById("email");
  const fechaEl = document.getElementById("fecha-nac");
  const nacEl = document.getElementById("nacionalidad");
  const fotoEl = document.getElementById("foto-perfil");

  if (nombreVisitadoEl) nombreVisitadoEl.textContent = perfil?.nombre || "";
  if (nombreEl) nombreEl.textContent = perfil?.nombre || "";
  if (emailEl) emailEl.textContent = perfil?.email || "";
  if (fechaEl) fechaEl.textContent = formatearFechaDMY(perfil?.fecha_nac);
  if (nacEl) nacEl.textContent = perfil?.nacionalidad || "";
  if (fotoEl) {
    if (perfil?.foto_perfil && perfil.foto_perfil.startsWith("http")) {
      fotoEl.src = perfil.foto_perfil;
    } else {
      fotoEl.src = "img/usuario-camara.png";
    }
  }

  // Mostrar botón solo si no es tu propio perfil
  const acciones = document.getElementById("acciones-perfil");
  if (acciones) {
    acciones.innerHTML = "";

    if (perfilId && yoId && perfilId !== yoId) {
      // Verificar si ya lo sigues
      const estadoRes = await fetch(`${API_URL}/api/seguir/${perfilId}`, {
        credentials: "include"
      });
      const estadoData = await estadoRes.json();
      const yaSigues = !!estadoData?.sigo;

      acciones.innerHTML = `
        <button id="btn-seguir" class="${yaSigues ? "siguiendo" : ""}">
          ${yaSigues ? "Siguiendo" : "Seguir"}
        </button>
        <button id="btn-mensaje" class="btn-mensaje">Mensaje</button>`;

      const btnMensaje = document.getElementById("btn-mensaje");
      if (btnMensaje) btnMensaje.addEventListener("click", abrirChatConUsuario);

      const btnSeguir = document.getElementById("btn-seguir");
      if (btnSeguir) {
        btnSeguir.addEventListener("click", async () => {
          try {
            if (!btnSeguir.classList.contains("siguiendo")) {
              // Seguir
              const res = await fetch(`${API_URL}/api/seguir`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ seguido_id: perfilId })
              });
              const data = await res.json();
              if (data.success) {
                btnSeguir.classList.add("siguiendo");
                btnSeguir.textContent = "Siguiendo";
              }
            } else {
              // Dejar de seguir
              const res = await fetch(`${API_URL}/api/seguir/${perfilId}`, {
                method: "DELETE",
                credentials: "include"
              });
              const data = await res.json();
              if (data.success) {
                btnSeguir.classList.remove("siguiendo");
                btnSeguir.textContent = "Seguir";
              }
            }
          } catch (err) {
            console.error("❌ Error al cambiar estado de seguimiento:", err);
          }
        });
      }
    }
  }
});

function abrirChatConUsuario() {
  const urlParams = new URLSearchParams(window.location.search);
  const usuarioId = urlParams.get("id");

  if (usuarioId) {
    window.location.href = `chats.html?id=${usuarioId}`;
  } else {
    alert("No se pudo obtener el ID del usuario.");
  }
}












