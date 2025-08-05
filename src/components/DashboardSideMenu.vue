<!-- src/components/DashboardSideMenu.vue -->

<template>
  <div class="side-menu-wrapper">
    <!-- Logo siempre visible -->
    <div class="logo-section">
      <img src="@/assets/logo.png" alt="Logo" class="logo" />
    </div>
    <!-- Botón de menú visible siempre -->
    <div class="menu-toggle" @click="toggleMenu">☰</div>

    <!-- Menú lateral -->
    <div :class="['side-menu', { 'menu-open': menuOpen }]">

      <!-- Buscador -->
      <div class="search-box">
        <input type="text" placeholder="Buscar" />
      </div>

      <div class="menu-title">OPCIONES</div>

      <div class="menu-items">
        <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
          {{ item }}
        </div>
      </div>

      <!-- Botón de salir -->
      <div class="logout-button" @click="logout">
        Salir
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardSideMenu',
  data() {
    return {
      menuOpen: false,
      menuItems: [
        'Procesos de Negocio',
        'Procesos Back Office',
        'ACH Cámara de Compensación Automática',
        'Administración de Menú',
        'Depósitos a la Vista',
        'Servicios Bancarios',
        'Firma Digital',
        'Comercio Exterior',
        'Contabilidad',
        'Órdenes Ingreso & Egreso',
        'Administración del Sistema',
        'Gestión de Mecanismos',
        'Tesorería',
        'Garantías'
      ]
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    },
    logout() {
      alert('Salir clickeado') // Lógica real de logout aquí
    }
  }
}
</script>

<style scoped>
.side-menu-wrapper {
  position: relative;
}

.logo-section {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  padding: 5px;
}

.logo {
  width: 30px;
  height: auto;
  margin: 10px;
}

.menu-toggle {
  position: absolute;
  top: 45px;
  left: 7px;
  font-size: 30px;
  color: black;
  cursor: pointer;
  z-index: 10;
}

.side-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: linear-gradient(to bottom, #005b82, #00b374);
  color: black;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.side-menu.menu-open {
  transform: translateX(0);
}

.search-box {
  padding: 100px 20px 20px 5px;
}

.search-box input {
  width: 97%;
  padding: 8px;
  font-size: 14px;
}

.menu-title {
  background-color: #003865;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

.menu-items {
  flex-grow: 1;
  padding: 10px 20px;
  overflow-y: auto;
}

.menu-item {
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
  cursor: pointer;
}

.logout-button {
  background-color: #003865;
  color: white;
  text-align: center;
  padding: 15px;
  cursor: pointer;
}

</style>
