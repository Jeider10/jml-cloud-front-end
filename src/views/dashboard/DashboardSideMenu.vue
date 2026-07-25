<!-- src/components/DashboardSideMenu.vue -->

<template>
  <div class="side-menu-wrapper">
    <!-- 🔹 Overlay invisible para detectar clic fuera del menú -->
    <!-- <div v-if="menuOpen && pinned" class="menu-overlay" @click="collapseMenu"></div> -->

    <!-- Panel lateral fijo (colapsable/expandible) -->
    <div
      :class="['side-panel', { expanded: menuOpen }]"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
    >
      <!-- Sección superior (logo + botón menú + nueva venta + clientes + proveedores + productos + ventas + configuracion + usuario + botón salir) -->
      <div class="top-section">
        <!-- Logo — clic aquí colapsa/oculta el menú -->
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

        <!-- Botón de proveedores (solo ADMIN) -->
        <div
          v-if="isAdmin"
          class="proveedores-icon nav-row"
          @click="onProveedoresClick"
        >
          <img src="@/assets/img/Proveedores.png" alt="Proveedores" />
          <span class="label">Proveedores</span>
        </div>

        <!-- Botón de productos (solo ADMIN) -->
        <div
          v-if="isAdmin"
          class="productos-icon nav-row"
          @click="onProductosClick"
        >
          <img src="@/assets/img/Productos.png" alt="Productos" />
          <span class="label">Productos</span>
        </div>

        <!-- Botón de ventas -->
        <div class="ventas-icon nav-row" @click="onVentasClick">
          <img src="@/assets/img/Ventas.png" alt="Ventas" />
          <span class="label">Ventas</span>
        </div>

        <!-- 🔹 Solo visible para ADMIN -->
        <div
          v-if="isAdmin"
          class="usuario-icon nav-row"
          @click="onUsuarioClick"
        >
          <img src="@/assets/img/Usuario.png" alt="Usuario" />
          <span class="label">Usuarios Empresa</span>
        </div>

        <!-- 🔹 Solo visible para ADMIN -->
        <div
          v-if="isAdmin"
          class="configuracion-icon nav-row"
          @click="onConfiguracionClick"
        >
          <img src="@/assets/img/Configuracion.png" alt="Configuracion" />
          <span class="label">Configuración Empresa</span>
        </div>

        <!-- 🔹 Solo visible para USER -->
        <div
          v-if="isUser"
          class="configuracion-usuario-icon nav-row"
          @click="onConfiguracionUsuarioClick"
        >
          <img
            src="@/assets/img/Configuracion.png"
            alt="ConfiguracionUsuario"
          />
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
    <div
      :class="['side-menu', { 'menu-open': menuOpen }]"
      style="display: none"
    >
      <div class="menu-items">
        <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getSession, logoutBackend } from "@/services/apiAuthService";

export default {
  name: "DashboardSideMenu",
  data() {
    // Recuperar estado del menú desde localStorage
    const savedPinned = localStorage.getItem("menuPinned") === "true";
    return {
      menuOpen: savedPinned, // Si estaba pinned, arranca expandido
      pinned: savedPinned, // Si está "pinned" se queda fijo expandido
      hoverOpen: false, // Si se abrió por hover
      roleName: "",
    };
  },
  async created() {
    // ✅ Cargamos el roleName desde la sesión activa
    try {
      const session = getSession();
      this.roleName = session?.user?.roleName || "";
      console.log("🎭 Rol detectado en sesión:", this.roleName);
    } catch (error) {
      console.error("⚠️ Error al obtener el rol desde sesión:", error);
      this.roleName = "";
    }
    // Emitir estado inicial para que el contenido se posicione correctamente
    this.$emit("menu-toggle", this.menuOpen);
  },
  computed: {
    isAdmin() {
      // 👑 Control centralizado: ADMIN, ADMINISTRADOR o SUPERADMIN
      const role = (this.roleName || "").toUpperCase().trim();
      return ["ADMIN", "ADMINISTRADOR", "SUPERADMIN"].includes(role);
    },

    isUser() {
      // 👑 Control centralizado: USER, USUARIO o CAJERO
      const role = (this.roleName || "").toUpperCase().trim();
      return ["USER", "USUARIO", "CAJERO"].includes(role);
    },
  },
  methods: {
    // 🔹 Hover: expande temporalmente si no está pinned
    onMouseEnter() {
      if (!this.pinned && !this.menuOpen) {
        this.menuOpen = true;
        this.hoverOpen = true;
        // NO emitimos menu-toggle para hover temporal (el contenido no se mueve)
      }
    },

    // 🔹 Mouse sale: colapsa si solo fue hover (no pinned)
    onMouseLeave() {
      if (!this.pinned && this.hoverOpen) {
        this.menuOpen = false;
        this.hoverOpen = false;
        // NO emitimos menu-toggle (el contenido no se movió)
      }
    },

    // 🔹 Colapsar menú — SOLO se llama desde el logo
    collapseMenu() {
      this.menuOpen = false;
      this.pinned = false;
      this.hoverOpen = false;
      localStorage.setItem("menuPinned", "false");
      this.$emit("menu-toggle", false);
    },

    // 🔹 Pin: fijar el menú expandido
    pinMenu() {
      this.menuOpen = true;
      this.pinned = true;
      this.hoverOpen = false;
      localStorage.setItem("menuPinned", "true");
      this.$emit("menu-toggle", true);
    },

    // 🔹 Logo (Inicio) — navega al dashboard y fija el menú expandido
    onLogoClick() {
      this.pinMenu();
      this.$router.push("/dashboard");
    },

    // 🔹 Menú — ÚNICA forma de colapsar/expandir el menú
    onMenuClick() {
      if (this.pinned) {
        this.collapseMenu();
      } else {
        this.pinMenu();
      }
    },

    // 🔹 Opciones de navegación — fijan el menú y navegan
    onNuevaVentaClick() {
      this.pinMenu();
      this.$router.push("/nueva-venta");
    },
    onClientesClick() {
      this.pinMenu();
      this.$router.push("/clientes");
    },
    onProveedoresClick() {
      this.pinMenu();
      this.$router.push("/proveedores");
    },
    onProductosClick() {
      this.pinMenu();
      this.$router.push("/productos");
    },
    onVentasClick() {
      this.pinMenu();
      this.$router.push("/historial-ventas");
    },
    onConfiguracionClick() {
      this.pinMenu();
      this.$router.push("/configuracion-empresa");
    },
    onUsuarioClick() {
      this.pinMenu();
      this.$router.push("/configuracion-empresa-usuario");
    },
    // 🔹 Nueva ruta para configuración personal del usuario
    onConfiguracionUsuarioClick() {
      this.pinMenu();
      this.$router.push("/configuracion-usuario");
    },
    async logout() {
      // Limpieza completa de sesion con llamada al backend
      await logoutBackend();
      localStorage.removeItem("menuPinned");
      console.log("Sesion cerrada correctamente.");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.side-menu-wrapper {
  position: relative;
  display: flex;
}

/* 🔹 Overlay transparente para detectar clic fuera del menú */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 200px; /* empieza donde termina el menú expandido */
  right: 0;
  bottom: 0;
  z-index: 15;
  /* sin background visible, solo captura clics */
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
  transition:
    width 0.22s ease,
    padding 0.22s ease;
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
  overflow-y: auto; /* scroll cuando la pantalla es pequeña y no caben todos los items */
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
  transition: background 0.15s ease;
}

/* en expanded, icono + texto a la izquierda */
.side-panel.expanded .nav-row {
  justify-content: flex-start;
}

/* hover ligero */
.nav-row:hover {
  background: rgba(255, 255, 255, 0.12);
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
.configuracion-usuario-icon img,
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
