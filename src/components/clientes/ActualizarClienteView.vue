<!-- src/components/clientes/ActualizarClienteView.vue -->

<template>
  <div class="registro-cliente-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['cliente-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Cliente</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario cliente -->
      <div class="form-container">
        <div class="form-row">
          <label>DNI/RUC</label>
          <input v-model="clienteForm.dni" type="text" disabled />

          <label>Nombre</label>
          <input v-model="clienteForm.nombre" type="text" />

          <label>Apellido</label>
          <input v-model="clienteForm.apellido" type="text" />

          <label>Teléfono</label>
          <input v-model="clienteForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="clienteForm.direccion" type="text" />

          <button type="button" class="agregar-btn" @click="actualizarCliente">
            💾 Actualizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'ActualizarClienteView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      clienteForm: {
        dni: '',
        nombre: '',
        apellido: '',
        telefono: '',
        direccion: ''
      },
      mensaje: '',
      mensajeTipo: ''
    }
  },
  mounted() {
    const cliente = JSON.parse(localStorage.getItem('clienteActualizar'))
    if (cliente) {
      this.clienteForm = { ...cliente }
    }
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

    actualizarCliente() {
      if (!this.clienteForm.nombre || !this.clienteForm.apellido) {
        this.mostrarMensaje('Nombre y apellido son obligatorios.', 'error')
        return
      }

      const clientes = JSON.parse(localStorage.getItem('clientes')) || []
      const idx = clientes.findIndex(c => c.dni === this.clienteForm.dni)
      if (idx !== -1) {
        clientes[idx] = { ...clientes[idx], ...this.clienteForm }
        localStorage.setItem('clientes', JSON.stringify(clientes))
        this.mostrarMensaje(`Cliente ${this.clienteForm.nombre} actualizado correctamente.`, 'success')
      }
    }
  }
}
</script>

<style scoped>
.registro-cliente-wrapper {
  display: flex;
}

.cliente-container {
  position: absolute;
  top: 0;
  left: 60px;
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: #6fffd4;
  overflow-y: auto;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.cliente-container.expanded {
  left: 220px;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
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
.mensaje.warning { background: #f1c40f; color: #333; }
.mensaje.error   { background: #e74c3c; color: white; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-container { margin-bottom: 20px; }
.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

label { font-weight: bold; }

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}
.agregar-btn:hover { background: #005f8a; }
</style>
