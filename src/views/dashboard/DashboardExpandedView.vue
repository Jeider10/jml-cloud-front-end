<!-- src/views/dashboard/DashboardExpandedView.vue -->

<template>
  <div class="dashboard-container">
    <h1 class="welcome-text animate-rainbow-text">
      ¡Bienvenido!
    </h1>

    <h2 class="subtitle-text">Por favor, selecciona una opción del menú a la izquierda.</h2>

    <!-- Mensaje dinámico desde configuración -->
    <p class="description-text">
      {{ mensajeEmpresa }}
    </p>

    <!-- Imagen dinámica de la institución -->
    <img :src="logoEmpresa || require('@/assets/img/Institucion.png')" alt="Institución" class="instituto-image" />

    <!-- Footer -->
    <footer class="page-footer">
      <p>Copyright © 2025 Creative Tim</p>
      <p>Desarrollado por Ing. Jeider Montiel | Whatsapp | Facebook | TikTok</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "dashboard-page",
  data() {
    return {
      mensajeEmpresa: `Somos una institución comprometida con la formación integral de nuestros estudiantes,
      brindando educación de calidad con valores y excelencia académica.
      Nuestro objetivo es inspirar, educar y transformar vidas.
      ¡Bienvenido a una comunidad de aprendizaje, crecimiento y futuro!`,
      logoEmpresa: null // 🔹 Nuevo campo para la imagen
    }
  },
  mounted() {
    const data = JSON.parse(localStorage.getItem('empresa'))
    if (data) {
      if (data.mensaje) {
        this.mensajeEmpresa = data.mensaje
      }
      if (data.logo) {
        this.logoEmpresa = data.logo
      }
    }
  }
}
</script>


<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100%;
  margin-left: 0px; /* Deja espacio fijo para el menú */
  overflow: auto; /* 🔹 Cambié de hidden a auto para permitir scroll e impresión */
  background: linear-gradient(135deg, #74ebd5, #9face6);
  animation: gradientShift 10s ease infinite;
  position: relative; /* IMPORTANTE para posicionar hijos con absolute */
  transition: all 0.3s ease; /* animación suave */
}

.welcome-text {
  text-align: center;
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-top: 60px; /* ajusta según necesites espacio */
}

/* Subtítulo */
.subtitle-text {
  position: absolute;
  top: 180px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: max-content;
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  text-align: center;
}

/* Descripción */
.description-text {
  position: absolute;
  top: 240px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  font-size: 1.2rem;
  color: #222;
  text-align: center;
  line-height: 1.8;
  background-color: rgba(255, 255, 255, 0.6);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.2);
}

.instituto-image {
  display: block;
  margin: 288px auto 20px auto;
  max-width: 400px;
  width: 80%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.page-footer {
  position: absolute;
  bottom: 10px;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 0.9rem;
  color: #333;
  opacity: 0.8;
}

/* Animación arcoíris */
@keyframes rainbow-text {
  0% { color: red; }
  16% { color: orange; }
  32% { color: yellow; }
  48% { color: green; }
  64% { color: blue; }
  80% { color: indigo; }
  100% { color: violet; }
}

.animate-rainbow-text {
  animation: rainbow-text 4s infinite linear;
}

/* 🔹 Ajustes para impresión */
@media print {
  .dashboard-container {
    height: auto !important;
    overflow: visible !important;
    background: white !important;
  }

  .welcome-text {
    font-size: 2rem !important;
    text-shadow: none !important;
    margin-top: 20px !important;
  }

  .subtitle-text,
  .description-text,
  .instituto-image,
  .page-footer {
    position: static !important;
    transform: none !important;
    margin: 10px auto !important;
    width: 100% !important;
    box-shadow: none !important;
    background: none !important;
  }
}
</style>
