<template>
  <div class="dashboard-container">
    <h1 class="welcome-text animate-rainbow-text">
      ¡Bienvenido a la institución!
    </h1>
    <h2 class="subtitle-text">Por favor, selecciona una opción del menú a la izquierda.</h2>
    <p class="description-text">
      Somos una institución comprometida con la formación integral de nuestros estudiantes,<br />
      brindando educación de calidad con valores y excelencia académica.<br />
      Nuestro objetivo es inspirar, educar y transformar vidas.<br />
      ¡Bienvenido a una comunidad de aprendizaje, crecimiento y futuro!
    </p>

    <!-- Imagen de la institución -->
    <img src="@/assets/institucion.png" alt="Imagen de la institución" class="instituto-image" />

    <!-- Footer -->
    <footer class="page-footer">
      <p>Copyright © 2025 Creative Tim</p>
      <p>Desarrollado por Ing. Jeider Montiel | Whatsapp | Facebook | TikTok</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "dashboard-page"
};
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #74ebd5, #9face6);
  animation: gradientShift 10s ease infinite;
  position: relative; /* IMPORTANTE para posicionar hijos con absolute */
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
</style>
