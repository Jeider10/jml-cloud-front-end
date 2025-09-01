<!-- src/components/clientes/RegistroClienteView.vue -->

<template>
  <div class="registro-cliente-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['cliente-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro Cliente</h1>

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
              ⚠️ ¿Está seguro de eliminar al cliente
              {{ modalEliminar.cliente.nombres }}
              {{ modalEliminar.cliente.apellidos }}?
            </p>
            <div class="modal-buttons">
              <button class="btn-yes" @click="eliminarCliente(modalEliminar.idx)">Sí</button>
              <button class="btn-no" @click="modalEliminar.visible = false">No</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Formulario cliente -->
      <div class="form-container">
        <div class="form-row">
          <label>Identificación</label>
          <input v-model="clienteForm.identificacion" type="text" />

          <label>Nombres</label>
          <input v-model="clienteForm.nombres" type="text" />
          <label>Apellidos</label>
          <input v-model="clienteForm.apellidos" type="text" />
          <label>Teléfono</label>
          <input v-model="clienteForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="clienteForm.direccion" type="text" />

          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="agregarCliente">
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
          <span style="font-weight: bold;">Buscar por Identificación, Nombres o Apellidos:</span>

          <!-- Input y botones -->
          <div style="display: flex; gap: 4px;">
            <input v-model="busqueda" type="text" placeholder="Ingrese término de búsqueda" />
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro()"
                    @click="filtrarClientes">Buscar</button>
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro()"
                    @click="limpiarBusqueda">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de clientes -->
      <table class="clientes-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>IDENTIFICACIÓN</th>
            <th>NOMBRES</th>
            <th>APELLIDOS</th>
            <th>TELÉFONO</th>
            <th>DIRECCIÓN</th>
            <th>FECHA REGISTRO</th>
            <th>FECHA ACTUALIZACIÓN</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, idx) in clientesFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ c.identificacion }}</td>
            <td>{{ c.nombres }}</td>
            <td>{{ c.apellidos }}</td>
            <td>{{ c.telefono }}</td>
            <td>{{ c.direccion }}</td>
            <td>{{ formatearFecha(c.fechaCreacion) }}</td> <!-- ⏰ Fecha de registro -->
            <td>{{ formatearFecha(c.fechaActualizacion) }}</td> <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- Nuevo botón de actualizar -->
              <button class="update-btn" @click="abrirActualizarCliente(c)">✏️</button>
              <button class="delete-btn" @click="confirmarEliminar(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="clientesFiltrados.length === 0">
            <td colspan="9" class="empty-row">No hay clientes registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { listarClientes } from '@/services/apiCustomerService.js'

export default {
  name: 'RegistroClienteView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      clienteForm: {
        identificacion: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        direccion: ''
      },
      clientes: [],
      clientesFiltrados: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: '',
      // Modal de eliminación
      modalEliminar: {
        visible: false,
        idx: null,
        cliente: {}
      }
    }
  },
  mounted() {
    // 🔹 Cargar todos los clientes desde backend al iniciar
    this.cargarClientes()
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

    // 🔹 Función que llama al endpoint para listar todos los clientes
    async cargarClientes() {
      try {
        const response = await listarClientes() // ⚠️ Llama /clientes/listar-todo
        this.clientes = response.data
        this.clientesFiltrados = [...this.clientes]
      } catch (error) {
        console.error('❌ Error al cargar clientes:', error)

        // Mostrar mensaje real si hay respuesta del backend
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al cargar clientes desde el servidor.', 'error')
        }
      }
    },

    agregarCliente() {
      if (!this.clienteForm.identificacion) {
        this.mostrarMensaje('Ingrese la Identificación del cliente.', 'error')
        return
      }
      if (!this.clienteForm.nombres) {
        this.mostrarMensaje('Ingrese el nombre del cliente.', 'error')
        return
      }
      if (!this.clienteForm.apellidos) {
        this.mostrarMensaje('Ingrese el apellido del cliente.', 'error')
        return
      }

      // 🔍 Verificar si ya existe un cliente con la misma identificación
      const existente = this.clientes.find(c => c.identificacion === this.clienteForm.identificacion)
      if (existente) {
        this.mostrarMensaje(
          `⚠️ Ya existe un cliente con esta Identificación (${existente.identificacion}): ${existente.nombres} ${existente.apellidos}.`,
          'error'
        )
        return
      }

      // Guardar cliente con fecha y hora
      const nuevo = {
        ...this.clienteForm,
        fechaCreacion: new Date().toISOString()  // ⏰ aquí agregamos la fecha
      }
      this.clientes.push(nuevo)
      localStorage.setItem('clientes', JSON.stringify(this.clientes)) // 🔄 Guardamos en localStorage
      this.clientesFiltrados = [...this.clientes]
      this.mostrarMensaje(`✅ Cliente ${this.clienteForm.nombres} ${this.clienteForm.apellidos} registrado correctamente.`, 'success')

      // limpiar formulario
      this.clienteForm = { identificacion: '', nombres: '', apellidos: '', telefono: '', direccion: '' }
    },

    // Método para saber si hay datos en el formulario
    hayDatos() {
      return this.clienteForm.identificacion || this.clienteForm.nombres || this.clienteForm.apellidos || this.clienteForm.telefono || this.clienteForm.direccion
    },

    // Limpiar campos del formulario
    limpiarCampos() {
      this.clienteForm = { identificacion: '', nombres: '', apellidos: '', telefono: '', direccion: '' }
    },

    // Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    // Abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.cliente = this.clientes[idx]
      this.modalEliminar.visible = true
    },

    eliminarCliente(idx) {
      const eliminado = this.clientes[idx]
      this.clientes.splice(idx, 1)
      localStorage.setItem('clientes', JSON.stringify(this.clientes)) // 🔄 Actualizamos localStorage
      this.clientesFiltrados = [...this.clientes]
      this.mostrarMensaje(`🗑️ Cliente ${eliminado.nombres} ${eliminado.apellidos} eliminado.`, 'error')
      this.modalEliminar.visible = false
    },

    abrirActualizarCliente(cliente) {
      // Guardamos el cliente seleccionado para actualizar en localStorage
      localStorage.setItem('clienteActualizar', JSON.stringify(cliente))
      // Redirigimos a la vista de actualización
      this.$router.push({ name: 'ActualizarClienteView' }) // ✅ Nombre de component del index
    },

    filtrarClientes() {
      if (!this.busqueda.trim()) {
        this.limpiarBusqueda() // 🔹 Si no hay texto, recarga todos los clientes desde backend
        return
      }
      const texto = this.busqueda.toLowerCase()
      this.clientesFiltrados = this.clientes.filter(c =>
        c.identificacion.toLowerCase().includes(texto) ||
        c.nombres.toLowerCase().includes(texto) ||
        c.apellidos.toLowerCase().includes(texto)
      )
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.cargarClientes() // 🔹 Llama nuevamente a /clientes/listar-todo
    },
    formatearFecha(fecha) {
      if (!fecha) return ''
      return new Date(fecha).toLocaleString()
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
  background-color: #6fffd4; /* ✅ mismo color que NuevaVentaView.vue */
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

.form-container {
  margin-bottom: 0px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.form-filtro {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center; /* o center según prefieras */
  gap: 4px;                /* espacio entre el texto y los inputs/botones */
  margin-top: 20px;         /* espacio arriba del bloque */
  margin-bottom: 12px;     /* espacio debajo del bloque */
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

.agregar-btn:hover {
  background: #005f8a;
}

.agregar-btn:disabled {
  background: #ccc;
  cursor: not-allowed; }

.agregar-btn:not(:disabled):hover {
  background: #e76f51;
}

/* Nuevo botón limpiar campos */
.limpiar-campos-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #f4a261;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed; }

.limpiar-campos-btn:not(:disabled):hover {
  background: #e76f51;
}

.update-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f4a261;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 4px;
}
.update-btn:hover { background: #e76f51; }

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.clientes-table th,
.clientes-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.delete-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #e63946;
  color: white;
  border: none;
  cursor: pointer;
}
.delete-btn:hover { background: #b52a33; }

.empty-row { text-align: center; padding: 18px; color: #666; }

.buscar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #06d6a0;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.buscar-btn:hover {
  background: #049670;
}

.buscar-btn:disabled {
  background: #ccc;
  cursor: not-allowed; }

.buscar-btn:not(:disabled):hover {
  background: #e76f51;
}

.limpiar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #06d6a0;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.limpiar-btn:hover {
  background: #049670;
}

.limpiar-btn:disabled {
  background: #ccc;
  cursor: not-allowed; }

.limpiar-btn:not(:disabled):hover {
  background: #e76f51;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
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

.btn-yes, .btn-no {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-yes { background: #e63946; color: white; }
.btn-yes:hover { background: #b52a33; }

.btn-no { background: #06d6a0; color: white; }
.btn-no:hover { background: #049670; }
</style>
