import { mostrarNotificacion } from '../PERFIL-JS/notificaciones.js';



// 📦 Referencias a los elementos del buscador
const inputBusqueda = document.getElementById("input-busqueda");
const resultadosBusqueda = document.getElementById("resultados-busqueda");

// 🔍 Función de búsqueda de usuarios
async function buscarUsuarios(query) {
  try {
    const res = await fetch(`http://localhost:3000/api/usuarios/buscar?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      credentials: 'include' // 👈 importante para que funcione con sesión
    });

    const data = await res.json();
    console.log("📦 Respuesta del backend:", data);

    if (!resultadosBusqueda) return;
    resultadosBusqueda.innerHTML = "";

    const lista = data.usuarios || [];
    if (data.success && Array.isArray(lista) && lista.length > 0) {
      lista.forEach(u => {
        const li = document.createElement("li");

        const img = document.createElement("img");
        img.src = u.foto_perfil 
          ? `http://localhost:3000/uploads/${u.foto_perfil}`
          : "img/usuario-camara.png";

        const span = document.createElement("span");
        span.textContent = u.nombre 
          ? `${u.nombre} (${u.usuario})`
          : u.usuario;

        li.appendChild(img);
        li.appendChild(span);

        li.addEventListener("click", () => {
          window.location.href = `vistaPerfil.html?id=${u.id}`;
        });

        resultadosBusqueda.appendChild(li);
      });
    } else {
      resultadosBusqueda.innerHTML = "<li>No se encontraron usuarios</li>";
    }
  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
  }
}

// 🎯 Activar buscador en el input
if (inputBusqueda && resultadosBusqueda) {
  inputBusqueda.addEventListener("input", () => {
    const query = inputBusqueda.value.trim();
    if (query.length >= 2) {
      buscarUsuarios(query);
    } else {
      resultadosBusqueda.innerHTML = "";
    }
  });

  // 🔄 Refrescar resultados cada 30 segundos
  setInterval(() => {
    const query = inputBusqueda.value.trim();
    if (query.length >= 2) {
      buscarUsuarios(query);
    }
  }, 30000);
}


