import { mostrarNotificacion } from './notificaciones.js';
import { mostrarConfirmacion } from './confirmacion.js';
import { enviarImagenAlBackend } from './perfil.js';

export const configurarSelfieCamara = () => {
  const btnSelfie = document.getElementById('btn-selfie');
  const video = document.getElementById('video-selfie');
  const canvas = document.getElementById('canvas-selfie');
  const cuenta = document.getElementById('cuenta-regresiva');
  const fotoPerfil = document.getElementById('foto-perfil');
  const placeholderIcon = document.getElementById('placeholder-icon');
  const mensajeImagen = document.getElementById('mensaje-imagen');

  let stream = null;

  btnSelfie.onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.classList.remove('d-none');
      cuenta.classList.remove('d-none');

      let segundos = 3;
      cuenta.textContent = segundos;

      const intervalo = setInterval(() => {
        segundos--;
        cuenta.textContent = segundos;
        if (segundos === 0) {
          clearInterval(intervalo);
          cuenta.classList.add('d-none');
          capturarSelfie();
        }
      }, 1000);
    } catch (error) {
      mostrarNotificacion('❌ No se pudo acceder a la cámara');
      console.error(error);
    }
  };

  const capturarSelfie = () => {
    const contexto = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imagenData = canvas.toDataURL('image/jpeg');
    video.classList.add('d-none');
    stream.getTracks().forEach(track => track.stop());

    fotoPerfil.src = imagenData;
    fotoPerfil.classList.remove('d-none');
    placeholderIcon.classList.add('d-none');
    mensajeImagen.classList.remove('d-none');

    mostrarConfirmacion(() => {
      const blob = dataURLtoBlob(imagenData);
      enviarImagenAlBackend(blob);
    });
  };

  const dataURLtoBlob = dataURL => {
    const partes = dataURL.split(',');
    const mime = partes[0].match(/:(.*?);/)[1];
    const binario = atob(partes[1]);
    const arreglo = new Uint8Array(binario.length);
    for (let i = 0; i < binario.length; i++) {
      arreglo[i] = binario.charCodeAt(i);
    }
    return new Blob([arreglo], { type: mime });
  };
};