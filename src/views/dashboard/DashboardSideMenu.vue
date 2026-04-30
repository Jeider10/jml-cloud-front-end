<!-- src/components/DashboardSideMenu.vue -->

<template>
  <div class="side-menu-wrapper">
    <!-- Panel lateral fijo (colapsable/expandible) -->
    <div :class="['side-panel', { expanded: menuOpen }]">
      <!-- Sección superior (logo + botón menú + nueva venta + clientes + proveedores + productos + ventas + configuracion + usuario + botón salir) -->
      <div class="top-section">
        <!-- Logo -->
        <div class="logo-icon nav-row" @click="onLogoClick">
          <img src="@/assets/img/LogoVue.png" alt="Logo" class="logo" />
          <!-- etiqueta solo visible si expanded -->
          <span class="label">Inicio</span>
        </div>

        <!-- Menú principal de menu justo debajo del logo -->
        <div class="menu-icon nav-row" @click="onMenuClick">
          <img src="@/assets/img/Menu.png" alt="Menu" />
          <span class="label">Menú</span>
        </div>

        <!-- Botón de nueva venta justo debajo del botón del menú -->
        <div class="nueva-venta-icon nav-row" @click="onNuevaVentaClick">
          <img src="@/assets/img/NuevaVenta.png" alt="NuevaVenta" />
          <span class="label">Nueva Venta</span>
        </div>

        <!-- Botón de clientes justo debajo del botón de nueva venta -->
        <div class="clientes-icon nav-row" @click="onClientesClick">
          <img src="@/assets/img/Clientes.png" alt="Clientes" />
          <span class="label">Clientes</span>
        </div>

        <!-- Botón de proveedores -->
        <div class="proveedores-icon nav-row" @click="onProveedoresClick">
          <img src="@/assets/img/Proveedores.png" alt="Proveedores" />
          <span class="label">Proveedores</span>
        </div>

        <!-- Botón de productos -->
        <div class="productos-icon nav-row" @click="onProductosClick">
          <img src="@/assets/img/Productos.png" alt="Productos" />
          <span class="label">Productos</span>
        </div>

        <!-- Botón de ventas -->
        <div class="ventas-icon nav-row" @click="onVentasClick">
          <img src="@/assets/img/Ventas.png" alt="Ventas" />
          <span class="label">Ventas</span>
        </div>

        <!-- 🔹 Solo visible para ADMIN -->
        <div v-if="isAdmin" class="usuario-icon nav-row" @click="onUsuarioClick">
          <img src="@/assets/img/Usuario.png" alt="Usuario" />
          <span class="label">Usuarios Empresa</span>
        </div>

        <!-- 🔹 Solo visible para ADMIN -->
        <div v-if="isAdmin" class="configuracion-icon nav-row" @click="onConfiguracionClick">
          <img src="@/assets/img/Configuracion.png" alt="Configuracion" />
          <span class="label">Configuración Empresa</span>
        </div>

        <!-- 🔹 Solo visible para USER -->
        <div v-if="isUser" class="configuracion-usuario-icon nav-row" @click="onConfiguracionUsuarioClick">
          <img src="@/assets/img/Configuracion.png" alt="ConfiguracionUsuario" />
          <span class="label">Configuración Usuario</span>
        </div>
      </div>

      <!-- 🔹 Botón de salir siempre abajo -->
      <div class="bottom-section">
        <div class="logout-icon nav-row" @click="logout">
          <img src="@/assets/img/BotonSalir.png" alt="Salir" />
          <span class="label">Salir</span>
        </div>
      </div>
    </div>

    <!-- Menú desplegable original (lo dejamos, oculto para no romper nada) -->
    <div :class="['side-menu', { 'menu-open': menuOpen }]" style="display: none;">
      <div class="menu-items">
        <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSession, logoutBackend } from '@/services/apiAuthService'

export default {
  name: 'DashboardSideMenu',
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      roleName: ''
    }
  },
  async created() {
    // ✅ Cargamos el roleName desde la sesión activa
    try {
      const session = getSession()
      this.roleName = session?.user?.roleName || ''
      console.log('🎭 Rol detectado en sesión:', this.roleName)
    } catch (error) {
      console.error('⚠️ Error al obtener el rol desde sesión:', error)
      this.roleName = ''
    }
  },
  computed: {
    isAdmin() {
      // 👑 Control centralizado: si roleName === 'ADMIN'
      return this.roleName?.toUpperCase() === 'ADMIN'
    },

    isUser() {
      // 👑 Control centralizado: si roleName === 'USER'
      return this.roleName?.toUpperCase() === 'USER'
    }
  },
  methods: {
    onLogoClick() {
      // Puedes redirigir a dashboard si lo deseas
      this.$router.push('/dashboard')
    },
    onMenuClick() {
      // alterna el estado expandido/colapsado
      // this.menuOpen = !this.menuOpen // Comentada siempre expandido, descomentada se oculta
      this.$emit('menu-toggle', this.menuOpen)
    },
    onNuevaVentaClick() {
      this.$router.push('/nueva-venta')
    },
    onClientesClick() {
      this.$router.push('/clientes')
    },
    onProveedoresClick() {
      this.$router.push('/proveedores')
    },
    onProductosClick() {
      this.$router.push('/productos')
    },
    onVentasClick() {
      this.$router.push('/historial-ventas')
    },
    onConfiguracionClick() {
      this.$router.push('/configuracion-empresa')
    },
    onUsuarioClick() {
      this.$router.push('/configuracion-empresa-usuario')
    },
    // 🔹 Nueva ruta para configuración personal del usuario
    onConfiguracionUsuarioClick() {
      this.$router.push('/configuracion-usuario')
    },
    async logout() {
      // Limpieza completa de sesion con llamada al backend
      await logoutBackend()
      console.log('Sesion cerrada correctamente.')
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

/* Panel lateral fijo (colapsado por defecto) */
.side-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 60px; /* ancho colapsado: solo icons */
  height: 100vh;
  background-color: #005b82;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center; /* iconos centrados cuando colapsado */
  z-index: 20;
  padding: 8px 6px;
  transition: width 0.22s ease, padding 0.22s ease;
  overflow: hidden;
}

/* cuando se expande muestra labels y alinea a la izquierda */
.side-panel.expanded {
  width: 200px; /* ancho expandido */
  align-items: flex-start;
  padding: 12px 12px;
}

/* Sección superior (contiene las filas) */
.top-section {
  display: flex;
  flex-direction: column;
  align-items: center; /* centrado en colapsado */
  gap: 8px;
  width: 100%;
}

/* en expandido alineamos a la izquierda */
.side-panel.expanded .top-section {
  align-items: flex-start;
}

/* fila genérica: icono + label */
.nav-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 44px;
  padding: 6px;
  box-sizing: border-box;
  cursor: pointer;
  border-radius: 8px;
  justify-content: center; /* centra iconos cuando colapsado */
}

/* en expanded, icono + texto a la izquierda */
.side-panel.expanded .nav-row {
  justify-content: flex-start;
}

/* hover ligero */
.nav-row:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* label: oculto cuando colapsado (no ocupa espacio) */
.label {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  display: none; /* oculto por defecto */
}

/* cuando está expandido mostramos label */
.side-panel.expanded .label {
  display: inline-block;
}

/* iconos (mismo tamaño para todos) */
.logo-icon img,
.menu-icon img,
.nueva-venta-icon img,
.clientes-icon img,
.proveedores-icon img,
.productos-icon img,
.ventas-icon img,
.configuracion-icon img,
.usuario-icon img,
.logout-icon img {
  width: 26px;
  height: 26px;
  display: block;
}

/* Sección inferior (botón salir) */
.bottom-section {
  margin-bottom: 12px;
  width: 100%;
  display: flex;
  justify-content: center; /* centrado cuando colapsado */
}

/* en expandido lo alineamos a la izquierda */
.side-panel.expanded .bottom-section {
  justify-content: flex-start;
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
</style>
