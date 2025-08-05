<template>
  <div class="side-menu-wrapper">
    <!-- Panel lateral fijo -->
    <div class="side-panel">
      <div class="top-section">
        <!-- Logo -->
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>

        <!-- Botón del menú justo debajo del logo -->
        <div class="menu-toggle" @click="toggleMenu">☰</div>
      </div>

      <!-- Botón de salir siempre abajo -->
      <div class="bottom-section">
        <div class="logout-icon" @click="logout">
          <img src="@/assets/boton-salir.png" alt="Salir" />
        </div>
      </div>
    </div>

    <!-- Menú desplegable -->
    <div :class="['side-menu', { 'menu-open': menuOpen }]">
      <div class="search-box">
        <input type="text" placeholder="Buscar" />
      </div>

      <div class="menu-title">OPCIONES</div>

      <div class="menu-items">
        <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
          {{ item }}
        </div>
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
      // Redirigir al login o ejecutar logout real
      alert('Salir clickeado')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.side-menu-wrapper {
  position: relative;
  display: flex;
}

/* Panel lateral fijo (contiene logo, botón del menú y botón salir) */
.side-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px;
  height: 100vh;
  background-color: #005b82;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  padding: 10px 0;
}

/* Sección superior (logo + botón menú) */
.top-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

/* Logo */
.logo-section {
  margin-bottom: 10px;
}

.logo {
  width: 30px;
  height: auto;
}

/* Botón del menú */
.menu-toggle {
  font-size: 30px;
  color: white;
  cursor: pointer;
  top: 50px;
  position: absolute;
}

/* Sección inferior (botón salir) */
.bottom-section {
  margin-bottom: 20px;
}

.logout-icon {
  cursor: pointer;
}

.logout-icon img {
  width: 25px;
  height: 25px;
}

/* Menú lateral desplegable */
.side-menu {
  position: fixed;
  top: 0;
  left: 60px; /* Desplazado según el ancho del panel */
  width: 250px;
  height: 100vh;
  background: linear-gradient(to bottom, #005b82, #00b374);
  color: black;
  transform: translateX(-100%);
  transition: transform 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
}

.side-menu.menu-open {
  transform: translateX(0);
}

/* Buscador */
.search-box {
  top: 0;
  left: 0;
  width: 100%;
  padding: 1px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #005b82, #00b374);
  margin-bottom: 0px; /* <---- Aquí controlas la distancia */
}

.search-box input {
  width: 97%;
  padding: 8px;
  font-size: 14px;
}

/* Título del menú */
.menu-title {
  background-color: #003865;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
}

/* Lista de ítems */
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

</style>
