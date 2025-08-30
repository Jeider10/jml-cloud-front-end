<!-- src/components/proveedores/RegistroProveedorView.vue -->

<template>
  <div class="registro-proveedor-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro Proveedor</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Modal de confirmación de eliminación -->
      <transition name="fade">
        <div v-if="modalEliminar.visible" class="modal-overlay">
          <div class="modal-content">
            <p>⚠️ ¿Está seguro de eliminar al proveedor {{ modalEliminar.proveedor.nombre }}?</p>
            <div class="modal-buttons">
              <button class="btn-yes" @click="eliminarProveedor(modalEliminar.idx)">Sí</button>
              <button class="btn-no" @click="modalEliminar.visible = false">No</button>
            </div>
          </div>
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

          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="agregarProveedor">
            ➕ Registrar
          </button>

          <!-- Nuevo botón Limpiar campos -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
            🧹 Limpiar campos
          </button>
        </div>

        <!-- 🔍 Filtro de búsqueda -->
        <div class="form-filtro">
          <span style="font-weight: bold;">Buscar por NIC o Nombre:</span>
          <div style="display: flex; gap: 4px;">
            <input v-model="busqueda" type="text" placeholder="Ingrese término de búsqueda" />
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro()"
                    @click="filtrarProveedores">Buscar</button>
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro()"
                    @click="limpiarBusqueda">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de proveedores -->
      <table class="proveedores-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NIC</th>
            <th>NOMBRE</th>
            <th>TELÉFONO</th>
            <th>DIRECCIÓN</th>
            <th>CORREO</th>
            <th>FECHA REGISTRO</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in proveedoresFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ p.nic }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.telefono }}</td>
            <td>{{ p.direccion }}</td>
            <td>{{ p.correo }}</td>
            <td>{{ p.fechaRegistro }}</td>
            <td>
              <button class="update-btn" @click="abrirActualizarProveedor(p)">✏️</button>
              <button class="delete-btn" @click="confirmarEliminar(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="proveedoresFiltrados.length === 0">
            <td colspan="8" class="empty-row">No hay proveedores registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'RegistroProveedorView',
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
      proveedores: [],
      proveedoresFiltrados: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: '',
      modalEliminar: {
        visible: false,
        idx: null,
        proveedor: {}
      }
    }
  },
  mounted() {
    this.proveedores = JSON.parse(localStorage.getItem('proveedores')) || []
    this.proveedoresFiltrados = [...this.proveedores]
  },
  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
      }, 3000)
    },

    agregarProveedor() {
      if (!this.proveedorForm.nic) {
        this.mostrarMensaje('Ingrese el NIC del proveedor.', 'error')
        return
      }
      if (!this.proveedorForm.nombre) {
        this.mostrarMensaje('Ingrese el nombre del proveedor.', 'error')
        return
      }

      const existente = this.proveedores.find(p => p.nic === this.proveedorForm.nic)
      if (existente) {
        this.mostrarMensaje(
          `⚠️ Ya existe un proveedor con este NIC (${existente.nic}): ${existente.nombre}.`,
          'error'
        )
        return
      }

      const nuevo = {
        ...this.proveedorForm,
        fechaRegistro: new Date().toLocaleString()
      }
      this.proveedores.push(nuevo)
      localStorage.setItem('proveedores', JSON.stringify(this.proveedores))
      this.proveedoresFiltrados = [...this.proveedores]

      this.mostrarMensaje(`✅ Proveedor ${this.proveedorForm.nombre} registrado correctamente.`, 'success')

      this.proveedorForm = { nic: '', nombre: '', telefono: '', direccion: '', correo: '' }
    },

    hayDatos() {
      return this.proveedorForm.nic || this.proveedorForm.nombre || this.proveedorForm.telefono || this.proveedorForm.direccion || this.proveedorForm.correo
    },

    limpiarCampos() {
      this.proveedorForm = { nic: '', nombre: '', telefono: '', direccion: '', correo: '' }
    },

    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.proveedor = this.proveedores[idx]
      this.modalEliminar.visible = true
    },

    eliminarProveedor(idx) {
      const eliminado = this.proveedores[idx]
      this.proveedores.splice(idx, 1)
      localStorage.setItem('proveedores', JSON.stringify(this.proveedores))
      this.proveedoresFiltrados = [...this.proveedores]
      this.mostrarMensaje(`🗑️ Proveedor ${eliminado.nombre} eliminado.`, 'error')
      this.modalEliminar.visible = false
    },

    abrirActualizarProveedor(proveedor) {
      localStorage.setItem('proveedorActualizar', JSON.stringify(proveedor))
      this.$router.push({ name: 'ActualizarProveedorView' })
    },

    filtrarProveedores() {
      const texto = this.busqueda.toLowerCase()
      this.proveedoresFiltrados = this.proveedores.filter(p =>
        p.nic.toLowerCase().includes(texto) ||
        p.nombre.toLowerCase().includes(texto)
      )
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.proveedoresFiltrados = [...this.proveedores]
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
.titulo { font-size: 2rem; font-weight: bold; margin-bottom: 20px; text-align: center; }
.mensaje { padding: 12px 18px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; text-align: center; box-shadow: 0px 4px 8px rgba(0,0,0,0.15); }
.mensaje.success { background: #2ecc71; color: white; }
.mensaje.warning { background: #f1c40f; color: #333; }
.mensaje.error   { background: #e74c3c; color: white; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.form-container { margin-bottom: 0px; }
.form-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
.form-filtro { display: flex; flex-direction: column; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 20px; margin-bottom: 12px; }
label { font-weight: bold; }
input { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
.agregar-btn, .limpiar-campos-btn, .update-btn, .delete-btn, .buscar-btn { border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
.agregar-btn { padding: 8px 12px; background: #0077b6; color: white; }
.agregar-btn:hover { background: #005f8a; }
.agregar-btn:disabled { background: #ccc; cursor: not-allowed; }
.limpiar-campos-btn { padding: 8px 12px; background: #f4a261; color: white; }
.limpiar-campos-btn:disabled { background: #ccc; cursor: not-allowed; }
.update-btn { padding: 6px 8px; background: #f4a261; color: white; margin-right: 4px; }
.update-btn:hover { background: #e76f51; }
.delete-btn { padding: 6px 8px; background: #e63946; color: white; }
.delete-btn:hover { background: #b52a33; }
.proveedores-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.proveedores-table th, .proveedores-table td { border: 1px solid #ddd; padding: 8px; text-align: center; background: white; }
.empty-row { text-align: center; padding: 18px; color: #666; }
.buscar-btn { padding: 6px 12px; background: #06d6a0; color: white; margin-left: 4px; }
.buscar-btn:hover { background: #049670; }
.buscar-btn:disabled { background: #ccc; cursor: not-allowed; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-content { background: white; padding: 20px 30px; border-radius: 8px; text-align: center; min-width: 300px; box-shadow: 0px 8px 16px rgba(0,0,0,0.25); }
.modal-buttons { margin-top: 15px; display: flex; justify-content: center; gap: 15px; }
.btn-yes { padding: 6px 12px; background: #e63946; color: white; }
.btn-yes:hover { background: #b52a33; }
.btn-no { padding: 6px 12px; background: #06d6a0; color: white; }
.btn-no:hover { background: #049670; }
</style>
