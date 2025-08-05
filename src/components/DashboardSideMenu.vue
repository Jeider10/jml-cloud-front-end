<template>
  <div class="side-menu-wrapper">
    <!-- Panel lateral fijo -->
    <div class="side-panel">
      <!-- Sección superior (logo + botón menú + favoritos + usuario + informacion + configuracion + mensaje + botón salir) -->
      <div class="top-section">
        <!-- Logo -->
        <div class="logo-section">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>

        <!-- Botón del menú justo debajo del logo -->
        <div class="menu-toggle" @click="toggleMenu">☰</div>

        <!-- Botón de favoritos justo debajo del botón del menú -->
        <div class="favorites-icon" @click="onFavoritesClick">
          <img src="@/assets/favoritos.png" alt="Favoritos" />
        </div>

        <!-- Botón de usuario justo debajo del botón de favoritos -->
        <div class="usuario-icon" @click="onUsuarioClick">
          <img src="@/assets/usuario.png" alt="Usuario" />
        </div>

        <!-- Botón de information justo debajo del botón de usuario -->
        <div class="information-icon" @click="onInformationClick">
          <img src="@/assets/informacion.png" alt="Information" />
        </div>

        <!-- Botón de configuration justo debajo del botón de information -->
        <div class="configuration-icon" @click="onConfigurationClick">
          <img src="@/assets/configuracion.png" alt="Configuracion" />
        </div>

        <!-- Botón de mensaje justo debajo del botón de configuracion -->
        <div class="usuario-icon" @click="onMensajeClick">
          <img src="@/assets/mensaje.png" alt="Mensaje" />
        </div>
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

    onFavoritesClick() {
      // alert('Favoritos clickeado')
    },

    onUsuarioClick() {
      // alert('Usuario clickeado')
    },

    onInformationClick() {
      // alert('Information clickeado')
    },

    onConfigurationClick() {
      // alert('Configuration clickeado')
    },

    onMensajeClick() {
      // alert('Mensaje clickeado')
    },

    logout() {
      // Redirigir al login o ejecutar logout real
      // alert('Salir clickeado')
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

.favorites-icon {
  margin-top: 40px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.favorites-icon img {
  width: 25px;
  height: 25px;
}

.usuario-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.usuario-icon img {
  width: 25px;
  height: 25px;
}

.information-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.information-icon img {
  width: 25px;
  height: 25px;
}

.configuration-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.configuration-icon img {
  width: 25px;
  height: 25px;
}

.mensaje-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.mensaje-icon img {
  width: 25px;
  height: 25px;
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
