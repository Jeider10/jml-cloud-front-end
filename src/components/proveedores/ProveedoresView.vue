<!-- src/components/proveedores/ProveedoresView.vue -->

<template>
  <div class="registro-proveedor-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['proveedor-container', { expanded: menuOpen }]">
      <h1 class="titulo">Proveedores</h1>

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

      <!-- 🔍 Filtro de búsqueda -->
      <div class="form-filtro">
        <!-- Texto descriptivo -->
        <span style="font-weight: bold;">Buscar por:</span>

        <!-- Nuevo: selector + input + botones -->
        <div style="display: flex; gap: 4px;">
          <select v-model="tipoBusqueda">
            <option disabled value="">Seleccione</option>
            <option value="codigoSucursal">Código Sucursal</option>
            <option value="nombre">Nombre</option>
          </select>

          <!-- 🔍 Termino de búsqueda -->
          <input v-model="busqueda"
                 type="text"
                 placeholder="Ingrese término de búsqueda"
                 :disabled="!tipoBusqueda" />

          <!-- 🔍 Botón de búsqueda -->
          <button type="button"
                  class="buscar-btn"
                  :disabled="!hayDatosFiltro() || !tipoBusqueda"
                  @click="filtrarProveedores">
                  🔍 Buscar
          </button>

          <!-- 🧹 Botón de limpiar búsqueda -->
          <button type="button"
                  class="buscar-btn"
                  :disabled="!hayDatosFiltro() || !tipoBusqueda"
                  @click="limpiarBusqueda">
                  🧹 Limpiar
          </button>

          <!-- ➕ Botón de registrar producto -->
          <button type="button"
                  class="agregar-btn"
                  @click="agregarProveedor">
                  ➕ Registrar Proveedor
          </button>
        </div>
      </div>

      <!-- Tabla proveedores -->
      <table class="proveedores-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>CÓDIGO SUCURSAL</th>
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
            <td>{{ p.codigoSucursal }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.telefono }}</td>
            <td>{{ p.direccion }}</td>
            <td>{{ p.correo }}</td>
            <td>{{ p.fechaCreacion }}</td> <!-- ⏰ Fecha de registro -->
            <td>{{ p.fechaActualizacion }}</td> <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- ✏️ Botón de editar -->
              <button class="update-btn"
                      @click="abrirActualizarProveedor(p)">
                      ✏️
              </button>
              <!-- 🗑️️ Botón de eliminar -->
              <button class="delete-btn"
                      @click="confirmarEliminar(idx)">
                      🗑️
              </button>
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
  buscarProveedorPorCodigoSucursal,
  buscarProveedorPorNombre,
  eliminarProveedorPorCodigoSucursal
} from '@/services/apiSuppliersService.js'

export default {
  name: 'ProveedoresView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      proveedorForm: {
        codigoSucursal: '',
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
      tipoBusqueda: '',
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
    // handleMenuToggle(state) {
      // this.menuOpen = state // Se descomenta cuando menuOpen: false
    // },

    // 🔹 Método de mostrar mensaje
    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
      }, 3000)
    },

    // 🔹 Método de cargar proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores() // ⚠️ Llama /proveedores/listar-proveedores
        this.proveedores = response.data
        this.proveedoresFiltrados = [...this.proveedores]

      } catch (error) {
        console.error('❌ Error al cargar proveedores:', error)

        // Mostrar mensaje si hay respuesta del backend
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de proveedores.', 'error')
        }
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.proveedorForm.codigoSucursal ||
             this.proveedorForm.nombre ||
             this.proveedorForm.telefono ||
             this.proveedorForm.direccion ||
             this.proveedorForm.correo;
    },

    // 🔹 Método de limpiar campos del formulario
    limpiarCampos() {
      this.proveedorForm = {
        codigoSucursal: '',
        nombre: '',
        telefono: '',
        direccion: '',
        correo: ''
      }
    },

    // 🔹 Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    // 🔹 Método para abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.proveedor = this.proveedores[idx]
      this.modalEliminar.visible = true
    },

    // 🔹 Método para eliminar producto
    async eliminarProveedor(idx) {
      const proveedor = this.proveedores[idx]
      try {
        await eliminarProveedorPorCodigoSucursal(proveedor.codigoSucursal)

        // ✅ Eliminamos solo si backend respondió bien
        this.proveedores.splice(idx, 1)
        this.proveedoresFiltrados = [...this.proveedores]

        this.mostrarMensaje(`🗑️ Proveedor ${proveedor.nombre} eliminado.`, 'success')

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

    // 🔹 Método para llamar al componente de agregar proveedor
    agregarProveedor(proveedor) {
      this.$router.push({
        name: 'RegistroProveedorView',
        state: { proveedor }
      })
    },

    // 🔹 Método para llamar al componente de actualizar proveedor
    abrirActualizarProveedor(proveedor) {
      this.$router.push({
        name: 'ActualizarProveedorView',
        params: {
          codigoSucursal: proveedor.codigoSucursal
        }
      })
    },

    // 🔹 Método para filtrar proveedores según el tipo de búsqueda
    async filtrarProveedores() {
      if (!this.busqueda.trim()) {
        this.limpiarBusqueda()
        return
      }

      const texto = this.busqueda.trim()

      try {
        let response
        switch (this.tipoBusqueda) {
          case 'codigoSucursal':
            response = await buscarProveedorPorCodigoSucursal(Number(texto)) // ✅ Codigo de Sucursal como número
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

    // 🔹 Método para limpiar búsqueda
    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = '' // 🔹 Resetea la opción del selector
      this.cargarProveedores() // 🔹 Vuelve a cargar todos los proveedores
    }
  }
}
</script>

<style scoped>
.registro-proveedor-wrapper {
  display: flex;
}

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

.proveedor-container.expanded {
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

.mensaje.success {
  background: #2ecc71;
  color: white;
}

.mensaje.warning {
  background: #f1c40f;
  color: #333;
}

.mensaje.error {
  background: #e74c3c;
  color: white;
}

.form-filtro {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
  margin-bottom: 12px;
}

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;         /* De aqui al final del boton era otro */
  background: #0077b6;
  color: white;
}

.update-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 8px;          /* De aqui al final del boton era otro */
  background: #f4a261;
  color: white;
  margin-right: 4px;
}

.delete-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 8px;         /* De aqui al final del boton era otro */
  background: #e63946;
  color: white;
}

.buscar-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 12px;         /* De aqui al final del boton era otro */
  background: #06d6a0;
  color: white;
  margin-left: 4px;
}

.agregar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.update-btn:hover {
  background: #e76f51;
}

.delete-btn:hover {
  background: #b52a33;
}

.proveedores-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.proveedores-table th {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.proveedores-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

.buscar-btn:hover {
  background: #049670;
}

.buscar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.25);
}

.modal-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-yes {
  padding: 6px 12px;
  background: #e63946;
  color: white;
}

.btn-yes:hover {
  background: #b52a33;
}

.btn-no {
  padding: 6px 12px;
  background: #06d6a0;
  color: white;
}

.btn-no:hover {
  background: #049670;
}
</style>
