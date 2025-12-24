const API_URL = "https://phonic-odyssey-480319-a4.rj.r.appspot.com";

// ---------- Utilidades ----------
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

// ---------- Render de publicación ----------
function renderPublicacion(pub) {
  const div = document.createElement("div");
  div.className = "publicacion";

  // Foto del autor (http vs uploads)
  const autorFoto = pub.autor_foto
    ? (pub.autor_foto.startsWith("http")
        ? pub.autor_foto
        : `${API_URL}/uploads/${pub.autor_foto}`)
    : "img/usuario-camara.png";

  div.innerHTML = `
    <div class="d-flex align-items-center gap-2 mb-2">
      <img src="${autorFoto}" alt="perfil" class="perfil-foto">
      <div>
        <strong>${pub.autor_nombre || "Usuario"}</strong>
        <br><small class="text-muted">${tiempoRelativo(pub.fecha_publicacion)}</small>
      </div>
      ${pub.usuario_id === window.miUsuarioId
        ? `<i class="fa fa-trash cursor-pointer btn-eliminar" data-id="${pub.id}" title="Eliminar publicación"></i>`
        : `<i class="fa fa-eye-slash text-muted cursor-pointer btn-ocultar" data-id="${pub.id}" title="Ocultar publicación"></i>`}
    </div>
  `;

  // Imagen de la publicación
  if (pub.imagen) {
    const img = document.createElement("img");
    img.src = pub.imagen.startsWith("http")
      ? pub.imagen
      : `${API_URL}/uploads/${pub.imagen}`;
    img.alt = "foto";
    img.className = "publicacion-imagen";
    div.appendChild(img);
  }

  // Texto
  if (pub.descripcion) {
    const texto = document.createElement("p");
    texto.className = "mb-1";
    texto.textContent = pub.descripcion;
    div.appendChild(texto);
  }

  // Form comentario
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
  boton.addEventListener("click", () => enviarComentario(pub.id));

  formComentario.appendChild(input);
  formComentario.appendChild(boton);
  div.appendChild(formComentario);

  // Contenedor de comentarios
  const listaComentarios = document.createElement("div");
  listaComentarios.className = "lista-comentarios mt-2";
  listaComentarios.id = `comentarios-${pub.id}`;
  div.appendChild(listaComentarios);

  // Listeners publicación
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

  // Cargar comentarios de esta publicación
  cargarComentarios(pub.id);

  return div;
}

// ---------- Listar comentarios ----------
async function cargarComentarios(publicacionId) {
  try {
    const res = await fetch(`${API_URL}/api/comentarios?publicacion_id=${publicacionId}`, {
      credentials: "include"
    });
    const data = await res.json();
    console.log("Comentarios recibidos:", publicacionId, data); // debug

    const contenedor = document.getElementById(`comentarios-${publicacionId}`);
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (data.success && Array.isArray(data.comentarios)) {
      data.comentarios.forEach(c => {
        const foto = c.foto_perfil
          ? (c.foto_perfil.startsWith("http")
              ? c.foto_perfil
              : `${API_URL}/uploads/${c.foto_perfil}`)
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

        const btnEliminar = comentarioDiv.querySelector(".btn-eliminar-comentario");
        if (btnEliminar) {
          btnEliminar.addEventListener("click", async () => {
            if (!confirm("¿Seguro que quieres eliminar este comentario?")) return;
            const comentarioId = btnEliminar.dataset.id;
            try {
              const r = await fetch(`${API_URL}/api/comentarios/${comentarioId}`, {
                method: "DELETE",
                credentials: "include"
              });
              const j = await r.json();
              if (j.success) comentarioDiv.remove();
              else alert("⚠️ No se pudo eliminar el comentario");
            } catch (err) {
              console.error("❌ Error al eliminar comentario:", err);
            }
          });
        }

        const btnOcultar = comentarioDiv.querySelector(".btn-ocultar-comentario");
        if (btnOcultar) {
          btnOcultar.addEventListener("click", () => {
            comentarioDiv.style.display = "none";
          });
        }

        contenedor.appendChild(comentarioDiv);
      });
    }
  } catch (err) {
    console.error("❌ Error al listar comentarios:", err);
  }
}

// ---------- Enviar comentario ----------
async function enviarComentario(publicacionId) {
  const input = document.getElementById(`input-comentario-${publicacionId}`);
  if (!input) return;
  const texto = input.value.trim();
  if (!texto) return;

  try {
    const res = await fetch(`${API_URL}/api/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ publicacion_id: publicacionId, texto })
    });

    const data = await res.json();
    console.log("Comentario enviado:", data); // debug

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

// ---------- Listar publicaciones ----------
async function cargarPublicaciones() {
  try {
    const res = await fetch(`${API_URL}/api/publicaciones`, { credentials: "include" });
    const data = await res.json();
    console.log("Publicaciones recibidas:", data); // debug

    const contenedor = document.getElementById("lista-publicaciones");
    if (!contenedor) {
      console.warn("No existe #lista-publicaciones en el HTML");
      return;
    }
    contenedor.innerHTML = "";

    if (data.success && Array.isArray(data.publicaciones)) {
      data.publicaciones.forEach(pub => {
        const div = renderPublicacion(pub);
        contenedor.appendChild(div);
      });
    } else {
      contenedor.innerHTML = "<p class='text-muted'>No hay publicaciones todavía.</p>";
    }
  } catch (err) {
    console.error("❌ Error al listar publicaciones:", err);
  }
}

// ---------- Exponer funciones globales ----------
window.cargarPublicaciones = cargarPublicaciones;
window.cargarComentarios = cargarComentarios;
window.enviarComentario = enviarComentario;

// ---------- Inicio ----------
document.addEventListener("DOMContentLoaded", async () => {
  const descripcion = document.getElementById("descripcion");
  const imagenInput = document.getElementById("imagen");
  const preview = document.getElementById("preview-imagen");
  const btnPublicar = document.getElementById("btn-publicar");
  const btnCancelar = document.getElementById("btn-cancelar");
  const perfilAutor = document.getElementById("perfil-autor");

  // Mis datos
  try {
    const meRes = await fetch(`${API_URL}/api/usuarios/mis-datos`, { credentials: "include" });
    const meData = await meRes.json();
    window.miUsuarioId = meData?.usuario?.id;
    const foto = meData?.usuario?.foto_perfil;
    if (perfilAutor) {
      perfilAutor.src = foto
        ? (foto.startsWith("http") ? foto : `${API_URL}/uploads/${foto}`)
        : "img/usuario-camara.png";
    }
    console.log("Usuario logueado:", window.miUsuarioId);
  } catch (e) {
    console.warn("No se pudo cargar mis datos");
  }

  // Preview
  if (imagenInput && preview) {
    imagenInput.addEventListener("change", () => {
      const file = imagenInput.files?.[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.style.display = "block";
      } else {
        preview.style.display = "none";
      }
    });
  }

  // Publicar
if (btnPublicar && descripcion) {
  btnPublicar.addEventListener("click", async () => {
    const imagen = imagenInput?.files?.[0] || null;
    const texto = (descripcion.value || "").trim();

    // Validación previa
    if (!imagen && !texto) {
      alert("Debes escribir un comentario o subir una imagen.");
      return;
    }

    const formData = new FormData();

    // ⚠️ IMPORTANTE: usa los nombres exactos que tu backend espera.
    // Si tu backend espera "texto" en vez de "descripcion", cambiá la key.
    if (texto) formData.append("descripcion", texto);

    if (imagen) {
      // Adjunta con nombre de archivo para parsers tipo busboy/multer
      formData.append("imagen", imagen, imagen.name);
    }

    // Debug: ver qué entra en el FormData
    console.log("FormData ->");
    for (const [key, value] of formData.entries()) {
      console.log(key, value instanceof File ? { name: value.name, size: value.size, type: value.type } : value);
    }

    try {
      const res = await fetch(`${API_URL}/api/publicaciones`, {
        method: "POST",
        credentials: "include",
        body: formData
        // NO pongas headers Content-Type con FormData: el navegador lo pone con boundary
      });

      const data = await res.json().catch(() => ({ success: false, message: "Respuesta no JSON" }));
      console.log("Publicación creada:", data);

      if (res.status === 413) {
        alert("La imagen es muy pesada. Intenta con un archivo más pequeño.");
        return;
      }

      if (data.success) {
        descripcion.value = "";
        if (imagenInput) imagenInput.value = "";
        if (preview) preview.style.display = "none";
        cargarPublicaciones();
      } else {
        // Mensajes más claros según lo que responde el backend
        alert(`⚠️ Error al crear publicación: ${data.message || res.status}`);
      }
    } catch (err) {
      console.error("❌ Error al publicar:", err);
      alert("❌ Falló el envío de la publicación. Intenta de nuevo.");
    }
  });
}


  // Cancelar
  if (btnCancelar && descripcion && imagenInput && preview) {
    btnCancelar.addEventListener("click", () => {
      descripcion.value = "";
      imagenInput.value = "";
      preview.style.display = "none";
    });
  }

  // Cargar publicaciones al inicio
  cargarPublicaciones();
});

