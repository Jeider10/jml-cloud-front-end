<!-- src/components/proveedores/ActualizarProveedorView.vue -->

<template>
  <div class="registro-proveedor-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Proveedor</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario proveedor -->
      <div class="form-container">
        <div class="form-row">
          <label>NIC</label>
          <input v-model="proveedorForm.nic" type="text" />

          <label>Nombre</label>
          <input v-model="proveedorForm.nombre" type="text" />

          <label>Teléfono</label>
          <input v-model="proveedorForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="proveedorForm.direccion" type="text" />

          <label>Correo</label>
          <input v-model="proveedorForm.correo" type="text" />

          <button type="button" class="agregar-btn" @click="actualizarProveedor">
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
  name: 'ActualizarProveedorView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      proveedorForm: {
        nic: '',
        nombre: '',
        telefono: '',
        direccion: '',
        correo: ''
      },
      mensaje: '',
      mensajeTipo: '',
      nicOriginal: '' // para rastrear el NIC original
    }
  },
  mounted() {
    const proveedor = JSON.parse(localStorage.getItem('proveedorActualizar'))
    if (proveedor) {
      this.proveedorForm = { ...proveedor }
      this.nicOriginal = proveedor.nic // guardamos el NIC original
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

    actualizarProveedor() {
      if (!this.proveedorForm.nic || !this.proveedorForm.nombre) {
        this.mostrarMensaje('NIC y nombre son obligatorios.', 'error')
        return
      }

      const proveedores = JSON.parse(localStorage.getItem('proveedores')) || []

      // Verificamos si el NIC ya existe en otro proveedor
      const duplicado = proveedores.find(p => p.nic === this.proveedorForm.nic && p.nic !== this.nicOriginal)
      if (duplicado) {
        this.mostrarMensaje(`⚠️ Ya existe un proveedor con este NIC (${duplicado.nic}).`, 'error')
        return
      }

      const idx = proveedores.findIndex(p => p.nic === this.nicOriginal)
      if (idx !== -1) {
        // Actualizamos datos y fecha de registro
        proveedores[idx] = { ...proveedores[idx], ...this.proveedorForm, fechaRegistro: new Date().toLocaleString() }
        localStorage.setItem('proveedores', JSON.stringify(proveedores))

        this.mostrarMensaje(`Proveedor ${this.proveedorForm.nombre} actualizado correctamente.`, 'success')

        // Volver automáticamente a la vista de registro después de 2 segundos
        setTimeout(() => {
          this.$router.push({ name: 'RegistroProveedorView' })
        }, 2000)
      }
    }
  }
}
</script>

<style scoped>
.registro-proveedor-wrapper { display: flex; }

.proveedor-container {
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

.proveedor-container.expanded { left: 220px; }

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

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-container { margin-bottom: 20px; }
.form-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }

label { font-weight: bold; }

input { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }

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
