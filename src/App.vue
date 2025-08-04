<!-- src/App.vue -->
<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div id="app">
    <!-- Aquí se cargan las páginas (Dashboard, Login, etc.) -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 10px;

  /* Elimina esto si ya no lo necesitas */
  /* margin-top: 60px; */
}
</style>
