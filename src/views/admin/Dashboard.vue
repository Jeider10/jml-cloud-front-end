<template>
  <div class="dashboard-container">
    <h1 class="welcome-text animate-rainbow-text">
      ¡Bienvenido!
    </h1>

    <!-- Subtítulo -->
    <h2 class="subtitle-text">
      Por favor, selecciona una opción en el menú de la izquierda.
    </h2>

    <!-- Descripción de la empresa -->
    <p class="description-text">
      En <strong>Delicias Gourmet</strong> nos apasiona brindar experiencias culinarias inolvidables.<br />
      Nuestros platos combinan tradición y creatividad, elaborados con ingredientes frescos y locales.<br />
      Ofrecemos un ambiente acogedor, ideal para compartir momentos especiales con tus seres queridos.<br />
      ¡Déjate sorprender por nuestros sabores únicos y el mejor servicio!
    </p>
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
  position: absolute;
  top: 100px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  width: max-content; /* necesario para que funcione el centrado */
  text-align: center;
  font-size: 4rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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

/* Animación arcoíris */
@keyframes rainbow-text {
  0% {
    color: red;
  }
  16% {
    color: orange;
  }
  32% {
    color: yellow;
  }
  48% {
    color: green;
  }
  64% {
    color: blue;
  }
  80% {
    color: indigo;
  }
  100% {
    color: violet;
  }
}

.animate-rainbow-text {
  animation: rainbow-text 4s infinite linear;
}
</style>
