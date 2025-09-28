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

    <!-- Imagen de la institución -->
    <img src="@/assets/img/Institucion.png" alt="Institución" class="instituto-image" />

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
      ¡Bienvenido a una comunidad de aprendizaje, crecimiento y futuro!`
    }
  },
  mounted() {
    const data = JSON.parse(localStorage.getItem('empresa'))
    if (data && data.mensaje) {
      this.mensajeEmpresa = data.mensaje
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh; /* que ocupe mínimo el alto de la ventana */
  width: 100%;
  margin-left: 0px; /* Deja espacio fijo para el menú */
  overflow: hidden;
  background: linear-gradient(135deg, #74ebd5, #9face6);
  animation: gradientShift 10s ease infinite;
  position: relative; /* IMPORTANTE para posicionar hijos con absolute */
  transition: all 0.3s ease; /* animación suave */

  /* Nuevo: flexbox para empujar footer */
  display: flex;
  flex-direction: column;
  align-items: center; /* centra horizontalmente todo */
}

.welcome-text {
  text-align: center;
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-top: -5px; /* ajusta según necesites espacio */
}

/* Subtítulo */
.subtitle-text {
  margin-top: -30px; /* espacio dinámico debajo del título */
  font-size: 1.5rem;
  font-weight: 500;
  color: #333;
  text-align: center;
}

/* Descripción */
.description-text {
  margin-top: -5px; /* espacio debajo del subtítulo */
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
  margin: 20px auto 20px auto; /* ahora el espacio depende del contenido de arriba */
  max-width: 400px;
  width: 80%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.page-footer {
  margin-top: auto; /* empuja el footer hacia abajo */
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
</style>
