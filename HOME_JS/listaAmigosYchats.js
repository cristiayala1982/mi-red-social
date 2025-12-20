const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";

async function cargarAmigos() {
  try {
    const res = await fetch(`${API_URL}/api/amigos`, { credentials: "include" });
    const data = await res.json();

    const listaAmigos = document.getElementById("lista-amigos");
    listaAmigos.innerHTML = "";

    if (!data.success) {
      listaAmigos.innerHTML = "<li>Error al cargar amigos</li>";
      mostrarNotificacion("❌ Error al cargar amigos", "error");
      return;
    }

    data.amigos.forEach(amigo => {
      const foto = amigo.foto_perfil && amigo.foto_perfil.trim() !== ""
        ? (amigo.foto_perfil.startsWith("http") ? amigo.foto_perfil : "img/usuario-camara.png")
        : "img/usuario-camara.png";

      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${foto}" alt="Foto perfil" class="foto-amigo">
        <span class="nombre-amigo">${amigo.nombre}</span>
        <i class="fa fa-comments cursor-pointer icono-chat" title="Chatear"></i>
      `;

      // ✅ Todo el bloque lleva al perfil
      li.addEventListener("click", () => {
        window.location.href = `vistaPerfil.html?id=${amigo.id}`;
      });

      // ✅ El ícono de chat funciona aparte
      li.querySelector(".icono-chat").addEventListener("click", (e) => {
        e.stopPropagation();
        abrirChat(amigo.id, amigo.nombre);
      });

      listaAmigos.appendChild(li);
    });
  } catch (error) {
    console.error("❌ Error cargando amigos:", error);
    const listaAmigos = document.getElementById("lista-amigos");
    listaAmigos.innerHTML = "<li>Error de conexión con el servidor</li>";
    mostrarNotificacion("❌ Error de conexión con el servidor", "error");
  }
}

function inicializarModalAmigos() {
  const btnAmigos = document.getElementById("btn-amigos");
  const modalAmigos = document.getElementById("modal-amigos");
  const cerrarModalAmigosBtn = document.getElementById("cerrar-modal-amigos");

  btnAmigos.addEventListener("click", () => {
    modalAmigos.style.display = "block";
    cargarAmigos();
  });

  cerrarModalAmigosBtn.addEventListener("click", () => {
    modalAmigos.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalAmigos) {
      modalAmigos.style.display = "none";
    }
  });
}

// 👉 Panel derecho chats con datos reales
async function cargarChats() {
  try {
    const res = await fetch(`${API_URL}/api/chats`, { credentials: "include" });
    const data = await res.json();

    const listaChats = document.getElementById("lista-chats");
    listaChats.innerHTML = "";

    if (!data.success) {
      listaChats.innerHTML = "<li>Error al cargar chats</li>";
      mostrarNotificacion("❌ Error al cargar chats", "error");
      return;
    }

    data.chats.forEach(chat => {
      const fotoValida = typeof chat.foto_perfil === "string" && chat.foto_perfil.trim() !== "";
      const foto = fotoValida
        ? (chat.foto_perfil.startsWith("http") ? chat.foto_perfil : "img/usuario-camara.png")
        : "img/usuario-camara.png";

      const li = document.createElement("li");
      li.classList.add("chat-item");

      // Si más adelante tu backend devuelve un campo `noLeidos`, lo usamos aquí
      const badge = chat.noLeidos && chat.noLeidos > 0
        ? `<span class="badge">${chat.noLeidos}</span>`
        : "";

      li.innerHTML = `
        <img src="${foto}" alt="Foto perfil" class="foto-chat">
        <div class="info-chat">
          <strong>${chat.nombre}</strong>
          <p>${chat.ultimo || ""}</p>
        </div>
        ${badge}
        <button class="btn-borrar-chat" title="Eliminar chat">🗑️</button>
      `;

      li.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn-borrar-chat")) {
          abrirChat(chat.id, chat.nombre);
        }
      });

      li.querySelector(".btn-borrar-chat").addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          const res = await fetch(`${API_URL}/api/chats/${chat.id}`, {
            method: "DELETE",
            credentials: "include"
          });
          const result = await res.json();
          if (result.success) {
            li.remove();
            mostrarNotificacion("✅ Chat eliminado");
          } else {
            mostrarNotificacion("❌ No se pudo borrar el chat", "error");
          }
        } catch (err) {
          console.error("❌ Error borrando chat:", err);
          mostrarNotificacion("❌ Error borrando chat", "error");
        }
      });

      listaChats.appendChild(li);
    });
  } catch (error) {
    console.error("❌ Error cargando chats:", error);
    const listaChats = document.getElementById("lista-chats");
    listaChats.innerHTML = "<li>Error de conexión con el servidor</li>";
    mostrarNotificacion("❌ Error de conexión con el servidor", "error");
  }
}

function mostrarNotificacion(texto, tipo = "success") {
  const box = document.getElementById("notificacion-chat");
  if (!box) return;

  box.textContent = texto;
  box.style.background = tipo === "error" ? "#d11a2a" : "#4caf50";
  box.classList.remove("oculto");
  box.classList.add("visible");

  setTimeout(() => {
    box.classList.remove("visible");
    box.classList.add("oculto");
  }, 3000);
}

function inicializarPanelChats() {
  const btnMensajes = document.getElementById("btn-mensajes");
  const panelChats = document.getElementById("panel-chats");
  const cerrarBtn = panelChats.querySelector(".cerrar-panel");

  btnMensajes.addEventListener("click", () => {
    panelChats.classList.add("visible");
    cargarChats();
    actualizarBadgeMensajes(); // refresca badge al abrir
  });

  cerrarBtn.addEventListener("click", () => {
    panelChats.classList.remove("visible");
  });
}

// 🚀 Inicialización única
document.addEventListener("DOMContentLoaded", () => {
  inicializarModalAmigos();
  inicializarPanelChats();
  //actualizarBadgeMensajes();
  //setInterval(actualizarBadgeMensajes, 30000); // refresca cada 30s
});

// 🚀 Función para abrir un chat
function abrirChat(id, nombre) {
  window.location.href = `chats.html?id=${id}`;
}












