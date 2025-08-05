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
  overflow: hidden; /* elimina scroll SOLO aquí */
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #74ebd5, #9face6);
  animation: gradientShift 10s ease infinite;
}

.welcome-text {
  font-size: 4rem;
  font-weight: bold;
  text-align: center;
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
