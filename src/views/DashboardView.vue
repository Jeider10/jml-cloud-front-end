<!-- src/views/DashboardView.vue -->
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

<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.dashboard {
  display: flex;
  height: 92vh;
}

.sidebar {
  width: 250px;
  background: linear-gradient(to bottom, #014c84, #02688a);
  color: white;
  display: flex;
  flex-direction: column; /* Asegura que los elementos estén en columna */
  justify-content: space-between; /* Espacio entre el contenido y el botón */
}

.sidebar .logo {
  padding: 20px;
  text-align: center;
  background-color: #003c6c;
  font-weight: bold;
  font-size: 18px;
  border-bottom: 1px solid #02688a;
}

/* Scroll encima del botón */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 10px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
}

/* Mejora el scroll visualmente */
.sidebar-content::-webkit-scrollbar {
  width: 8px;
}

.sidebar input {
  margin: 15px;
  padding: 8px;
  border: none;
  border-radius: 4px;
  width: calc(100% - 30px);
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar ul li {
  padding: 10px 20px;
  cursor: pointer;
}

.sidebar ul li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Botón fijo, mismo fondo del panel */
.logout {
  padding: 15px;
  text-align: center;
  background-color: #014c84; /* Mismo color que el panel */
  border-top: 1px solid #02688a;
  position: sticky;
  bottom: 0;
}

.logout button {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout button:hover {
  background-color: #d32f2f;
}

.content {
  margin-left: 250px;
  padding: 20px;
}

</style>
