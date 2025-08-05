<template>
  <div class="welcome-container">
    <h1 class="welcome-text">Bienvenido al sistema</h1>
  </div>
</template>

<script>
export default {
  name: "dashboard-page",
};
</script>

<style scoped>
.welcome-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #74ebd5, #9face6);
  animation: gradientShift 10s ease infinite;
}

.welcome-text {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  animation: fadeIn 2s ease-out;
}

/* Fondo animado */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Entrada del texto */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
