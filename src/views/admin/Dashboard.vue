<template>
  <div class="dashboard-container">
    <h1 class="welcome-text animate-rainbow-text">
      ¡Bienvenido!
    </h1>
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
