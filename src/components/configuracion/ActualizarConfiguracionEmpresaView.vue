<!-- src/components/clientes/ActualizarConfiguracionEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="menuOpen = $event" />

    <!-- Contenido principal -->
    <div :class="['main-content', { expanded: menuOpen }]">
      <h1 class="titulo">Datos de la Empresa</h1>

      <!-- Bloque con datos -->
      <div class="datos-empresa">
        <div class="dato-row">
          <label>NIC:</label>
          <input type="text" :value="empresa.nic" disabled />
        </div>
        <div class="dato-row">
          <label>Nombre:</label>
          <input type="text" :value="empresa.nombre" disabled />
        </div>
        <div class="dato-row">
          <label>Dirección:</label>
          <input type="text" :value="empresa.direccion" disabled />
        </div>
        <div class="dato-row">
          <label>Teléfono:</label>
          <input type="text" :value="empresa.telefono" disabled />
        </div>
        <div class="dato-row">
          <label>Mensaje:</label>
          <input type="text" :value="empresa.mensaje" disabled />
        </div>
      </div>

      <!-- Logo grande -->
      <div class="logo-container">
        <img src="@/assets/img/Empresa.png" alt="Logo Empresa" class="logo-empresa" />
      </div>

      <!-- Botón actualizar -->
      <div class="acciones">
        <button type="button" class="actualizar-btn" @click="irActualizar">
          ✏️ Actualizar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'ConfiguracionEmpresaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      empresa: {
        nic: '',
        nombre: '',
        direccion: '',
        telefono: '',
        mensaje: ''
      }
    }
  },
  mounted() {
    // cargar datos de empresa si ya existen
    const data = JSON.parse(localStorage.getItem('empresa'))
    if (data) this.empresa = data
  },
  methods: {
    irActualizar() {
      localStorage.setItem('empresaActualizar', JSON.stringify(this.empresa))
      this.$router.push({ name: 'ActualizarEmpresaView' })
    }
  }
}
</script>

<style scoped>
.configuracion-empresa-wrapper {
  display: flex;
}

.main-content {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: #6fffd4;
  transition: left 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content.expanded {
  left: 220px;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.datos-empresa {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0,0,0,0.15);
  margin-bottom: 30px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.dato-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dato-row label {
  width: 100px;
  font-weight: bold;
  text-align: left;
}
.dato-row input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  color: #333;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}
.logo-empresa {
  width: 600px; /* 👈 mucho más grande */
  height: auto;
}

.acciones {
  display: flex;
  justify-content: center;
}
.actualizar-btn {
  padding: 12px 20px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}
.actualizar-btn:hover {
  background: #005f8a;
}
</style>
