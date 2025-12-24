const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";
// 🚪 Lógica de cerrar sesión con confirmación
function configurarCerrarSesion() {
  const enlaceCerrarSesion = document.querySelector(".dropdown-menu a[href='#']");
  if (!enlaceCerrarSesion) return;

  enlaceCerrarSesion.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/usuario/logout`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();

      if (data.success) {
        // Mostrar mensaje de confirmación
        mostrarNotificacion("✅ Sesión cerrada correctamente");

        // Redirigir al login después de unos segundos
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Error al cerrar sesión:", err);
      mostrarNotificacion("⚠️ Error al cerrar sesión");
    }
  });
}
// 🔔 Helper para mostrar notificaciones rápidas
function mostrarNotificacion(mensaje) {
  let contenedor = document.getElementById("notificaciones");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "notificaciones";
    contenedor.style.position = "fixed";
    contenedor.style.top = "10px";
    contenedor.style.right = "10px";
    contenedor.style.zIndex = "9999";
    document.body.appendChild(contenedor);
  }
  const alerta = document.createElement("div");
  alerta.textContent = mensaje;
  alerta.style.background = "#28a745";
  alerta.style.color = "#fff";
  alerta.style.padding = "10px 15px";
  alerta.style.marginBottom = "5px";
  alerta.style.borderRadius = "5px";
  alerta.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  alerta.style.fontFamily = "sans-serif";

  contenedor.appendChild(alerta);

  // Quitar mensaje después de 2 segundos
  setTimeout(() => alerta.remove(), 2000);
}

// Ejecutar al cargar la página
configurarCerrarSesion();




