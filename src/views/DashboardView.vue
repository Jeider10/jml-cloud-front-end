// src/views/DashboardView.vue
<template>
  <div class="dashboard">
    <!-- Barra lateral -->
    <div class="sidebar">
      <!-- Logo -->
      <div class="logo">🔷 Mi Sistema</div>

      <!-- Contenido del menú (scrollable) -->
      <div class="sidebar-content">
        <input type="text" placeholder="Buscar..." />
        <ul>
          <li>Procesos de Negocio</li>
          <li>Procesos Back Office</li>
          <li>ACH Cámara de Compensación Automática</li>
          <li>Administración de Menú</li>
          <li>Depósitos a la Vista</li>
          <li>Servicios Bancarios</li>
          <li>Firma Digital</li>
          <li>Comercio Exterior</li>
          <li>Contabilidad</li>
          <li>Administración del Sistema</li>
          <li>Gestión de Mecanismos</li>
          <li>Tesorería</li>
          <li>Bancos</li>
        </ul>
      </div>

      <!-- Botón de cerrar sesión -->
      <div class="logout">
        <button @click="logout">Cerrar sesión</button>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="content">
      <h1>Bienvenido al sistema</h1>
      <p>Selecciona una opción del menú lateral para comenzar.</p>
    </div>
  </div>
</template>

<script>
import "@/assets/css/dashboard.css";

export default {
  name: "DashboardView",
  mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      this.$router.push("/login");
    }
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>
