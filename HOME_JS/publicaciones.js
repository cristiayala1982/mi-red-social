const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";

document.addEventListener("DOMContentLoaded", async () => {
  const descripcion = document.getElementById("descripcion");
  const imagenInput = document.getElementById("imagen");
  const preview = document.getElementById("preview-imagen");
  const btnPublicar = document.getElementById("btn-publicar");
  const btnCancelar = document.getElementById("btn-cancelar");
  const perfilAutor = document.getElementById("perfil-autor");

  // 1) Cargar foto del usuario logueado en el bloque de publicación
  try {
    const meRes = await fetch(`${API_URL}/api/usuarios/mis-datos`, { credentials: "include" });
    const meData = await meRes.json();
    const foto = meData?.usuario?.foto_perfil;
    perfilAutor.src = foto ? `${API_URL}/uploads/${foto}` : "img/usuario-camara.png";
    // 👇 Guardar el id del usuario logueado
    window.miUsuarioId = meData?.usuario?.id;
    console.log("Usuario logueado:", window.miUsuarioId); // debug
  } catch (e) {
    console.warn("No se pudo cargar la foto del autor");
  }

  // 2) Preview de imagen
  imagenInput.addEventListener("change", () => {
    const file = imagenInput.files[0];
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    } else {
      preview.style.display = "none";
    }
  });

// 3) Publicar
btnPublicar.addEventListener("click", async () => {
  const imagen = imagenInput.files[0];
  const texto = descripcion.value.trim();

  // Validación: debe haber al menos comentario o imagen
  if (!imagen && !texto) {
    alert("Debes escribir un comentario o subir una imagen.");
    return;
  }

  const formData = new FormData();
  formData.append("descripcion", texto);
  if (imagen) formData.append("imagen", imagen); // 👈 solo si existe

  try {
    const res = await fetch(`${API_URL}/api/publicaciones`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Publicación creada");
      descripcion.value = "";
      imagenInput.value = "";
      preview.style.display = "none";
      cargarPublicaciones();
    } else {
      alert("⚠️ Error al crear publicación: " + data.message);
    }
  } catch (err) {
    console.error("❌ Error al publicar:", err);
  }
});


  // 4) Cancelar subida
  btnCancelar.addEventListener("click", () => {
    descripcion.value = "";
    imagenInput.value = "";
    preview.style.display = "none";
  });

  // 5) Cargar publicaciones al inicio
  cargarPublicaciones();
});

// 📦 Listar publicaciones
// 📦 Listar publicaciones
async function cargarPublicaciones() {
  try {
    const res = await fetch(`${API_URL}/api/publicaciones`, { credentials: "include" });
    const data = await res.json();

    const contenedor = document.getElementById("lista-publicaciones");
    contenedor.innerHTML = "";

    if (data.success && Array.isArray(data.publicaciones)) {
      data.publicaciones.forEach(pub => {
        const div = renderPublicacion(pub);
        contenedor.appendChild(div); // 👈 mantiene el orden del backend
      });
    }
  } catch (err) {
    console.error("❌ Error al listar publicaciones:", err);
  }
}

//render Publicacion
function renderPublicacion(pub) {
  const div = document.createElement("div");
  div.className = "publicacion";

  // Cabecera (autor + fecha + icono)
  div.innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-2">
      <img src=`${API_URL}/uploads/${pub.autor_foto || "usuario-camara.png"}`
           alt="perfil" class="perfil-foto">
      <div>
        <strong>${pub.autor_nombre || "Usuario"}</strong>
        <br><small class="text-muted">${tiempoRelativo(pub.fecha_publicacion)}</small>
      </div>
      ${pub.usuario_id === window.miUsuarioId
        ? `<i class="fa fa-trash cursor-pointer btn-eliminar" data-id="${pub.id}" title="Eliminar publicación"></i>`
        : `<i class="fa fa-eye-slash text-muted cursor-pointer btn-ocultar" data-id="${pub.id}" title="Ocultar publicación"></i>`}
    </div>
  `;

  // Imagen (solo si existe)
  if (pub.imagen) {
    const img = document.createElement("img");
    img.src = `${API_URL}/uploads/${pub.imagen}`;
    img.alt = "foto";
    img.className = "publicacion-imagen";
    div.appendChild(img);
  }

  // Texto (solo si existe)
  if (pub.descripcion) {
    const texto = document.createElement("p");
    texto.className = "mb-1";
    texto.textContent = pub.descripcion;
    div.appendChild(texto);
  }

  // Bloque de comentarios (con createElement para mejor control)
  const formComentario = document.createElement("div");
  formComentario.className = "form-comentario mt-2";

  const input = document.createElement("input");
  input.id = `input-comentario-${pub.id}`;
  input.type = "text";
  input.className = "form-control";
  input.placeholder = "Escribe un comentario...";
  input.required = true;

  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = "btn btn-primary";
  boton.textContent = "Comentar";
  boton.onclick = () => enviarComentario(pub.id);

  formComentario.appendChild(input);
  formComentario.appendChild(boton);
  div.appendChild(formComentario);

  // Contenedor de comentarios
  const listaComentarios = document.createElement("div");
  listaComentarios.className = "lista-comentarios mt-2";
  listaComentarios.id = `comentarios-${pub.id}`;
  div.appendChild(listaComentarios);

  // Listeners
  const btnEliminar = div.querySelector(".btn-eliminar");
  if (btnEliminar) {
    btnEliminar.addEventListener("click", async () => {
      if (!confirm("¿Seguro que quieres eliminar esta publicación?")) return;
      try {
        const res = await fetch(`${API_URL}/api/publicaciones/${pub.id}`, {
          method: "DELETE",
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) div.remove();
        else alert("⚠️ No se pudo eliminar la publicación");
      } catch (err) {
        console.error("❌ Error al eliminar publicación:", err);
      }
    });
  }

  const btnOcultar = div.querySelector(".btn-ocultar");
  if (btnOcultar) {
    btnOcultar.addEventListener("click", () => {
      div.style.display = "none";
    });
  }

  cargarComentarios(pub.id);
  return div;
}
// 💬 Listar comentarios de una publicación
async function cargarComentarios(publicacionId) {
  try {
    const res = await fetch(`${API_URL}/api/comentarios?publicacion_id=${publicacionId}`, {
      credentials: "include"
    });
    const data = await res.json();

    const contenedor = document.getElementById(`comentarios-${publicacionId}`);
    contenedor.innerHTML = "";

    if (data.success && Array.isArray(data.comentarios)) {
      data.comentarios.forEach(c => {
        const foto = c.foto_perfil
          ? `${API_URL}/uploads/${c.foto_perfil}`
          : "img/usuario-camara.png";

        const comentarioDiv = document.createElement("div");
        comentarioDiv.className = "comentario mb-1";

 comentarioDiv.innerHTML = `
  <div class="comentario-cuerpo">
    <img src="${foto}" alt="perfil" class="comentario-foto">
    <div class="comentario-contenido">
      <div class="comentario-header">
        <strong>${c.autor_nombre || "Usuario"}</strong>
        <small>${tiempoRelativo(c.fecha_comentario)}</small>
      </div>
      <p class="comentario-texto">${c.texto}</p>
    </div>
    ${c.usuario_id === window.miUsuarioId
      ? `<i class="fa fa-trash cursor-pointer btn-eliminar-comentario" data-id="${c.id}" title="Eliminar comentario"></i>`
      : `<i class="fa fa-eye-slash cursor-pointer btn-ocultar-comentario" data-id="${c.id}" title="Ocultar comentario"></i>`}
  </div>
`;

        // Listener para eliminar comentario
        const btnEliminar = comentarioDiv.querySelector(".btn-eliminar-comentario");
        if (btnEliminar) {
          btnEliminar.addEventListener("click", async () => {
            if (!confirm("¿Seguro que quieres eliminar este comentario?")) return;
            const comentarioId = btnEliminar.dataset.id;
            try {
              const res = await fetch(`${API_URL}/api/comentarios/${comentarioId}`, {
                method: "DELETE",
                credentials: "include"
              });
              const data = await res.json();
              if (data.success) {
                comentarioDiv.remove(); // quitar del DOM
              } else {
                alert("⚠️ No se pudo eliminar el comentario");
              }
            } catch (err) {
              console.error("❌ Error al eliminar comentario:", err);
            }
          });
        }
        // Listener para ocultar comentario
        const btnOcultar = comentarioDiv.querySelector(".btn-ocultar-comentario");
        if (btnOcultar) {
          btnOcultar.addEventListener("click", () => {
            comentarioDiv.style.display = "none"; // oculta solo en la vista del usuario
          });
        }
        contenedor.appendChild(comentarioDiv);
      });
    }
  } catch (err) {
    console.error("❌ Error al listar comentarios:", err);
  }
}
// ✍️ Enviar comentario
async function enviarComentario(publicacionId) {
  const input = document.getElementById(`input-comentario-${publicacionId}`);
  if (!input) return;
  const texto = input.value.trim();
  if (!texto) return;

  try {
    console.log({ publicacion_id: publicacionId, texto });

    const res = await fetch(`${API_URL}/api/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ publicacion_id: publicacionId, texto })
    });

    const data = await res.json();

    if (data.success) {
      input.value = "";
      cargarComentarios(publicacionId);
    } else {
      console.error("❌ Error al agregar comentario:", data.message);
    }
  } catch (err) {
    console.error("❌ Error al enviar comentario:", err);
  }
}

// Exponer función al ámbito global para onclick en HTML
window.enviarComentario = enviarComentario;
//TIEMPO RELATIVO
function tiempoRelativo(fechaISO) {
  const fecha = new Date(fechaISO);
  const ahora = new Date();
  const diffSegundos = Math.floor((ahora - fecha) / 1000);

  if (diffSegundos < 60) return `subida hace ${diffSegundos} segundos`;
  const diffMinutos = Math.floor(diffSegundos / 60);
  if (diffMinutos < 60) return `subida hace ${diffMinutos} minutos`;
  const diffHoras = Math.floor(diffMinutos / 60);
  if (diffHoras < 24) return `subida hace ${diffHoras} horas`;
  const diffDias = Math.floor(diffHoras / 24);
  return `subida hace ${diffDias} días`;
}


