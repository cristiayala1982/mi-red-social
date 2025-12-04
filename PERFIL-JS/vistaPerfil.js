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
    const res = await fetch("http://localhost:3000/api/usuario/perfil", {
      credentials: "include"
    });
    const data = await res.json();

    if (data.success && data.usuario) {
      const u = data.usuario;

      // Foto de perfil
      document.getElementById("nav-foto-perfil").src = u.foto_perfil
        ? `http://localhost:3000/uploads/${u.foto_perfil}`
        : "img/usuario-camara.png";

      // Nombre de usuario
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
  document.querySelector(".mensaje-perfil").textContent = "No se encontró el perfil solicitado.";
} else {
  cargarDatosUsuario(idVisitado);
}

// 🚀 Cargar datos y galería del usuario visitado
async function cargarDatosUsuario(id) {
  try {
    const res = await fetch(`http://localhost:3000/api/usuario/perfil?id=${id}`, {
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
    document.getElementById("nombre").textContent = u.nombre || "";
    document.getElementById("email").textContent = u.email || "";
    document.getElementById("fecha-nac").textContent = formatearFechaDMY(u.fecha_nac);
    document.getElementById("nacionalidad").textContent = u.nacionalidad || "";

    // Mensaje personalizado
    document.getElementById("nombre-visitado").textContent = u.nombre || "";

    // Foto de perfil del usuario visitado
    document.getElementById("foto-perfil").src = u.foto_perfil
      ? `http://localhost:3000/uploads/${u.foto_perfil}`
      : "img/usuario-camara.png";

    // Galería
    const contenedor = document.getElementById("galeria");
    contenedor.innerHTML = "";

    if (Array.isArray(data.galeria) && data.galeria.length > 0) {
      data.galeria.forEach(img => {
        const contenedorImg = document.createElement("div");
        contenedorImg.classList.add("item-galeria");

        const elemento = document.createElement("img");
        elemento.src = `http://localhost:3000/uploads/${img.nombre_archivo}`;
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
  } catch (error) {
    console.error("❌ Error al cargar perfil:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // ID del perfil visitado (ejemplo: /vistaPerfil.html?id=72)
  const params = new URLSearchParams(window.location.search);
  const perfilId = Number(params.get("id"));

  // Usuario logueado (usando tu endpoint /mis-datos)
  const meRes = await fetch("http://localhost:3000/api/usuarios/mis-datos", { credentials: "include" });
  const meData = await meRes.json();
  const yoId = meData?.usuario?.id;

  // Datos del perfil visitado
  const perfilRes = await fetch(`http://localhost:3000/api/usuario/perfil?id=${perfilId}`, { credentials: "include" });
  const perfilData = await perfilRes.json();
  const perfil = perfilData?.usuario;

  // Rellenar datos en la vista
  document.getElementById("nombre-visitado").textContent = perfil?.nombre || "";
  document.getElementById("nombre").textContent = perfil?.nombre || "";
  document.getElementById("email").textContent = perfil?.email || "";
  document.getElementById("fecha-nac").textContent = formatearFechaDMY(perfil?.fecha_nac);
  document.getElementById("nacionalidad").textContent = perfil?.nacionalidad || "";
  document.getElementById("foto-perfil").src = perfil?.foto_perfil
    ? `http://localhost:3000/uploads/${perfil.foto_perfil}`
    : "img/usuario-camara.png";

  // Mostrar botón solo si no es tu propio perfil
  const acciones = document.getElementById("acciones-perfil");
  acciones.innerHTML = "";

  if (perfilId && yoId && perfilId !== yoId) {
    // Verificar si ya lo sigues
    const estadoRes = await fetch(`http://localhost:3000/api/seguir/${perfilId}`, {
      credentials: "include"
    });
    const estadoData = await estadoRes.json();
    const yaSigues = !!estadoData?.sigo;

    acciones.innerHTML = `
      <button id="btn-seguir" class="${yaSigues ? "siguiendo" : ""}">
        ${yaSigues ? "Siguiendo" : "Seguir"}
      </button>
      <button id="btn-mensaje" class="btn-mensaje">Mensaje</button>`;
    document.getElementById("btn-mensaje").addEventListener("click", abrirChatConUsuario);

    const btnSeguir = document.getElementById("btn-seguir");

    btnSeguir.addEventListener("click", async () => {
      try {
        if (!btnSeguir.classList.contains("siguiendo")) {
          // Seguir
          const res = await fetch("http://localhost:3000/api/seguir", {
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
          const res = await fetch(`http://localhost:3000/api/seguir/${perfilId}`, {
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
});

function abrirChatConUsuario() {
  // Obtener el parámetro "id" de la URL del perfil
  const urlParams = new URLSearchParams(window.location.search);
  const usuarioId = urlParams.get("id");

  if (usuarioId) {
    // Redirigir al chat con ese usuario
    window.location.href = `chats.html?id=${usuarioId}`;
  } else {
    alert("No se pudo obtener el ID del usuario.");
  }
}




