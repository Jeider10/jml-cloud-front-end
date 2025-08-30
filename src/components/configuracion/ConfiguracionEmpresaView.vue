<!-- src/components/clientes/ConfiguracionEmpresaView.vue -->

<template>
  <div class="configuracion-empresa-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['empresa-container', { expanded: menuOpen }]">
      <h1 class="titulo">Configuración de la Empresa</h1>

      <!-- Logo empresa -->
      <div class="logo-container">
        <img src="@/assets/img/Empresa.png" alt="Logo Empresa" class="logo-empresa" />
      </div>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario de datos empresa -->
      <div class="form-container">
        <div class="form-row">
          <label>NIC</label>
          <input v-model="empresa.nic" type="text" />

          <label>Nombre</label>
          <input v-model="empresa.nombre" type="text" />

          <label>Dirección</label>
          <input v-model="empresa.direccion" type="text" />

          <label>Teléfono</label>
          <input v-model="empresa.telefono" type="text" />

          <label>Mensaje</label>
          <input v-model="empresa.mensaje" type="text" />
        </div>

        <!-- Botones -->
        <div class="acciones">
          <button type="button"
                  class="guardar-btn"
                  @click="guardarEmpresa">
            💾 Guardar
          </button>

          <button type="button"
                  class="limpiar-btn"
                  @click="limpiarCampos">
            🧹 Limpiar
          </button>
        </div>
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
      },
      mensaje: '',
      mensajeTipo: ''
    }
  },
  mounted() {
    // cargar datos de empresa si ya existen
    const data = JSON.parse(localStorage.getItem('empresa'))
    if (data) this.empresa = data
  },
  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => { this.mensaje = '' }, 3000)
    },

    guardarEmpresa() {
      if (!this.empresa.nic || !this.empresa.nombre) {
        this.mostrarMensaje('⚠️ NIC y Nombre son obligatorios.', 'error')
        return
      }
      localStorage.setItem('empresa', JSON.stringify(this.empresa))
      this.mostrarMensaje('✅ Datos de la empresa guardados correctamente.', 'success')
    },

    limpiarCampos() {
      this.empresa = { nic: '', nombre: '', direccion: '', telefono: '', mensaje: '' }
    }
  }
}
</script>

<style scoped>
.configuracion-empresa-wrapper { display: flex; }

.empresa-container {
  position: absolute;
  top: 0; left: 60px; right: 0; bottom: 0;
  padding: 20px;
  background-color: #6fffd4;
  overflow-y: auto;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empresa-container.expanded { left: 220px; }

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.logo-empresa {
  width: 120px;
  height: auto;
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.15);
}
.mensaje.success { background: #2ecc71; color: white; }
.mensaje.error   { background: #e74c3c; color: white; }

.form-container { width: 100%; max-width: 600px; margin: auto; }
.form-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
label { font-weight: bold; }
input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.guardar-btn, .limpiar-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.guardar-btn { background: #0077b6; color: white; }
.guardar-btn:hover { background: #005f8a; }
.limpiar-btn { background: #f4a261; color: white; }
.limpiar-btn:hover { background: #e76f51; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
