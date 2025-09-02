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
            <p>
              ⚠️ ¿Está seguro de eliminar al proveedor
              {{ modalEliminar.proveedor.nombre }}?
            </p>
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
          <!-- Texto descriptivo -->
          <span style="font-weight: bold;">Buscar por:</span>

          <!-- Nuevo: selector + input + botones -->
          <div style="display: flex; gap: 4px;">
            <select v-model="tipoBusqueda">
              <option disabled value="">Seleccione</option>
              <option value="nic">NIC</option>
              <option value="nombre">Nombre</option>
            </select>

            <input v-model="busqueda"
                   type="text"
                   placeholder="Ingrese término de búsqueda"
                   :disabled="!tipoBusqueda" />

            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro() || !tipoBusqueda"
                    @click="filtrarProveedores">Buscar</button>
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro() || !tipoBusqueda"
                    @click="limpiarBusqueda">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla proveedores -->
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
            <th>FECHA ACTUALIZACIÓN</th>
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
            <td>{{ formatearFecha(p.fechaCreacion) }}</td> <!-- ⏰ Fecha de registro -->
            <td>{{ formatearFecha(p.fechaActualizacion) }}</td> <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- Nuevo botón de actualizar -->
              <button class="update-btn" @click="abrirActualizarProveedor(p)">✏️</button>
              <button class="delete-btn" @click="confirmarEliminar(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="proveedoresFiltrados.length === 0">
            <td colspan="9" class="empty-row">No hay proveedores registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import {
  listarProveedores,
  crearProveedor,
  buscarProveedorPorNic,
  buscarProveedorPorNombre,
  eliminarProveedorPorNic
} from '@/services/apiSuppliersService.js'

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
      tipoBusqueda: '', // 🔹 Nuevo: control del tipo de búsqueda
      // Modal de eliminación
      modalEliminar: {
        visible: false,
        idx: null,
        proveedor: {}
      }
    }
  },
  mounted() {
    // 🔹 Cargar todos los proveedores desde backend al iniciar
    this.cargarProveedores()
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

    // 🔹 Función que llama al endpoint para listar todos los  proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores() // ⚠️ Llama /proveedores/listarproveedores
        this.proveedores = response.data
        this.proveedoresFiltrados = [...this.proveedores]
      } catch (error) {
        console.error('❌ Error al cargar proveedores:', error)

        // Mostrar mensaje real si hay respuesta del backend
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de proveedores.', 'error')
        }
      }
    },

    // 🔹 Nuevo: agregar proveedor usando API real
    async agregarProveedor() {
      if (!this.proveedorForm.nic) {
        this.mostrarMensaje('Ingrese el NIC del proveedor.', 'error')
        return
      }
      if (!this.proveedorForm.nombre) {
        this.mostrarMensaje('Ingrese el nombre del proveedor.', 'error')
        return
      }
      if (!this.proveedorForm.telefono) {
        this.mostrarMensaje('Ingrese el telefono del proveedor.', 'error')
        return
      }
      if (!this.proveedorForm.direccion) {
        this.mostrarMensaje('Ingrese el direccion del proveedor.', 'error')
        return
      }
      if (!this.proveedorForm.correo) {
        this.mostrarMensaje('Ingrese el correo del proveedor.', 'error')
        return
      }

      // 🔍 Verificar si ya existe un cliente con la misma identificación en la lista local
      const existente = this.proveedores.find(p => p.nic === this.proveedorForm.nic)
      if (existente) {
        this.mostrarMensaje(
          `⚠️ Ya existe un proveedor con este NIC (${existente.data.nic}): ${existente.data.nombre}.`,
          'error'
        )
        return
      }

      try {
        // Llamada al backend
        const response = await crearProveedor(this.proveedorForm)
        const nuevoProveedor = response.data

        // Agregamos el proveedor retornado por el backend a la lista local
        this.proveedores.push(nuevoProveedor)
        this.proveedoresFiltrados = [...this.proveedores]
        this.mostrarMensaje(
          `✅ Proveedor ${nuevoProveedor.nombre} registrado correctamente.`,
          'success'
        )

        // limpiar formulario
        this.proveedorForm = { nic: '', nombre: '', telefono: '', direccion: '', correo: '' }
      } catch (error) {
        console.error('❌ Error al crear proveedor:', error)
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al crear proveedor en el servidor.', 'error')
        }
      }
    },

    // Método para saber si hay datos en el formulario
    hayDatos() {
      return this.proveedorForm.nic || this.proveedorForm.nombre || this.proveedorForm.telefono || this.proveedorForm.direccion || this.proveedorForm.correo
    },

    // Limpiar campos del formulario
    limpiarCampos() {
      this.proveedorForm = { nic: '', nombre: '', telefono: '', direccion: '', correo: '' }
    },

    // Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    // Abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.proveedor = this.proveedores[idx]
      this.modalEliminar.visible = true
    },

    async eliminarProveedor(idx) {
      const proveedor = this.proveedores[idx]
      try {
        await eliminarProveedorPorNic(proveedor.nic)

        // ✅ Eliminamos localmente solo si backend respondió bien
        this.proveedores.splice(idx, 1)
        this.proveedoresFiltrados = [...this.proveedores]
        this.mostrarMensaje(
          `🗑️ Proveedor ${proveedor.nombre} eliminado.`,
          'success'
        )
      } catch (error) {
        console.error('❌ Error al eliminar proveedor:', error)
        if (error.response && error.response.status === 404) {
          this.mostrarMensaje('⚠️ Proveedor ${proveedor.nombre} no encontrado en el servidor.', 'error')
        } else {
          this.mostrarMensaje('Error al eliminar proveedor en el servidor.', 'error')
        }
      } finally {
        this.modalEliminar.visible = false
      }
    },

    abrirActualizarProveedor(proveedor) {
      // Guardamos el cliente seleccionado para actualizar en localStorage
      localStorage.setItem('proveedorActualizar', JSON.stringify(proveedor))
      // Redirigimos a la vista de actualización
      this.$router.push({ name: 'ActualizarProveedorView' }) // ✅ Nombre de component del index
    },

    // 🔹 Nuevo: filtrar proveedores según el tipo de búsqueda y llamar endpoint correcto
    async filtrarProveedores() {
      if (!this.busqueda.trim()) {
        this.limpiarBusqueda()
        return
      }

      const texto = this.busqueda.trim()

      try {
        let response
        switch (this.tipoBusqueda) {
          case 'nic':
            response = await buscarProveedorPorNic(texto)
            break
          case 'nombre':
            response = await buscarProveedorPorNombre(texto)
            break
          default:
            this.mostrarMensaje('Seleccione un tipo de búsqueda válido.', 'error')
            return
        }

        const data = response.data

        if (Array.isArray(data)) {
          this.proveedoresFiltrados = data
        } else if (data) {
          // backend puede devolver objeto simple
          this.proveedoresFiltrados = [data]
        } else {
          this.proveedoresFiltrados = []
        }

        if (this.proveedoresFiltrados.length === 0) {
          this.mostrarMensaje('No se encontraron proveedores.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al filtrar proveedores:', error)

        // Si es un Error construido en el interceptor lo mostramos con detalle
        if (error.message) {
          if (error.message.includes('404')) {
            this.proveedoresFiltrados = []
            this.mostrarMensaje('No se encontró proveedores.', 'error')
          } else {
            // Intenta mostrar el mensaje del backend si vino
            this.mostrarMensaje(error.message, 'error')
          }
        } else {
          this.mostrarMensaje('Error al buscar proveedores en el servidor.', 'error')
        }
      }
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = '' // 🔹 Resetea la opción del selector
      this.cargarProveedores() // 🔹 Vuelve a cargar todos los proveedores
    },

    // 🔹 Método para formatear fechas
    formatearFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleString()
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
