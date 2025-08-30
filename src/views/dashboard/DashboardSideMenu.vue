<!-- src/components/DashboardSideMenu.vue -->

<template>
  <div class="side-menu-wrapper">
    <!-- Panel lateral fijo -->
    <div class="side-panel">
      <!-- Sección superior (logo + botón menú + nueva venta + clientes + proveedores + productos + ventas + configuracion + usuario + botón salir) -->
      <div class="top-section">
        <!-- Logo -->
        <div class="logo-icon" @click="onLogoClick">
          <img src="@/assets/img/LogoVue.png" alt="Logo" class="logo" />
        </div>

        <!-- Botón de menu justo debajo del logo -->
        <div class="menu-icon" @click="onMenuClick">
          <img src="@/assets/img/Menu.png" alt="Menu" />
        </div>

        <!-- Botón de nueva venta justo debajo del botón del menú -->
        <div class="nueva-venta-icon" @click="onNuevaVentaClick">
          <img src="@/assets/img/NuevaVenta.png" alt="NuevaVenta" />
        </div>

        <!-- Botón de clientes justo debajo del botón de nueva venta -->
        <div class="clientes-icon" @click="onClientesClick">
          <img src="@/assets/img/Clientes.png" alt="Clientes" />
        </div>

        <!-- Botón de proveedores justo debajo del botón de usuario -->
        <div class="proveedores-icon" @click="onProveedoresClick">
          <img src="@/assets/img/Proveedores.png" alt="Proveedores" />
        </div>

        <!-- Botón de productos justo debajo del botón de proveedores -->
        <div class="productos-icon" @click="onProductosClick">
          <img src="@/assets/img/Productos.png" alt="Productos" />
        </div>

        <!-- Botón de ventas justo debajo del botón de productos -->
        <div class="ventas-icon" @click="onVentasClick">
          <img src="@/assets/img/Ventas.png" alt="Ventas" />
        </div>

        <!-- Botón de configuracion justo debajo del botón de ventas -->
        <div class="configuracion-icon" @click="onConfiguracionClick">
          <img src="@/assets/img/Configuracion.png" alt="Configuracion" />
        </div>

        <!-- Botón de usuario justo debajo del botón de configuracion -->
        <div class="usuario-icon" @click="onUsuarioClick">
          <img src="@/assets/img/Usuario.png" alt="Usuario" />
        </div>
      </div>

      <!-- Botón de salir siempre abajo -->
      <div class="bottom-section">
        <div class="logout-icon" @click="logout">
          <img src="@/assets/img/BotonSalir.png" alt="Salir" />
        </div>
      </div>
    </div>

    <!-- Menú desplegable -->
    <div :class="['side-menu', { 'menu-open': menuOpen }]">
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
        'Nueva Venta',
        'Clientes',
        'Proveedor',
        'Productos',
        'Ventas',
        'Configuracion',
        'Usuarios'
      ]
    }
  },
  methods: {
    onLogClick() {
      // alert('NuevaVenta clickeado')
    },

    onMenuClick() {
      this.menuOpen = !this.menuOpen
      this.$emit('menu-toggle', this.menuOpen)
    },
    onNuevaVentaClick() {
      // alert('Nueva venta clickeado')
    },
    onClientesClick() {
      // alert('Clientes clickeado')
    },
    onProveedoresClick() {
      // alert('Proveedores clickeado')
    },
    onProductosClick() {
      // alert('Productos clickeado')
    },
    onVentasClick() {
      // alert('Ventas clickeado')
    },
    onConfiguracionClick() {
      // alert('Configuracion clickeado')
    },
    onUsuarioClick() {
      // alert('Usuario clickeado')
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
.logo-icon {
  margin-top: 1px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.logo-icon img {
  width: 25px;
  height: 25px;
}

/* Botón menú */
.menu-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.menu-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Nueva Venta */
.nueva-venta-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.nueva-venta-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Clientes */
.clientes-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.clientes-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Proveedores */
.proveedores-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.proveedores-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Productos */
.productos-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.productos-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Ventas */
.ventas-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.ventas-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Configuracion */
.configuracion-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.configuracion-icon img {
  width: 25px;
  height: 25px;
}

/* Botón Usuario */
.usuario-icon {
  margin-top: 10px; /* Puedes cambiar este valor para ajustar la distancia */
  cursor: pointer;
}

.usuario-icon img {
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
