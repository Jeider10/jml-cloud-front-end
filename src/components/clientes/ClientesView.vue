<!-- src/components/clientes/ClientesView.vue -->

<template>
  <div class="registro-cliente-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['cliente-container', { expanded: menuOpen }]">
      <h1 class="titulo">Clientes</h1>

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
              <!-- ✅ Botón de si -->
              <button class="btn-yes"
                      @click="eliminarCliente(modalEliminar.idx)">
                      Sí
              </button>
              <!-- ❌️ Botón de no -->
              <button class="btn-no"
                      @click="modalEliminar.visible = false">
                      No
              </button>
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
            <option disabled value="">Seleccione una opción</option>
            <option value="identificacion">Identificación</option>
            <option value="nombres">Nombres</option>
            <option value="apellidos">Apellidos</option>
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
                  @click="filtrarClientes">
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
                  @click="agregarCliente">
                  ➕ Registrar Cliente
          </button>
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
            <td>{{ c.fechaCreacion }}</td> <!-- ⏰ Fecha de registro -->
            <td>{{ c.fechaActualizacion }}</td> <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- ✏️ Botón de editar -->
              <button class="update-btn"
                      @click="abrirActualizarCliente(c)">
                      ✏️
              </button>
              <!-- 🗑️️ Botón de eliminar -->
              <button class="delete-btn"
                      @click="confirmarEliminar(idx)">
                      🗑️
              </button>
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
import {
  listarClientes,
  buscarClientePorIdentificacion,
  buscarClientePorNombres,
  buscarClientePorApellidos,
  eliminarClientePorIdentificacion
} from '@/services/apiCustomerService.js'

export default {
  name: 'RegistroClienteView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
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
      tipoBusqueda: '',
      // Modal de eliminación
      modalEliminar: {
        visible: false,
        idx: null,
        cliente: {}
      }
    }
  },

  // 🔹 Cargar todos los clientes desde backend al iniciar
  mounted() {
    this.cargarClientes()
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

    // 🔹 Método de cargar clientes
    async cargarClientes() {
      try {
        const response = await listarClientes() // ⚠️ Llama /clientes/listar-todo
        this.clientes = response.data
        this.clientesFiltrados = [...this.clientes]

      } catch (error) {
        console.error('❌ Error al cargar clientes:', error)

        // Mostrar mensaje si hay respuesta del backend
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de clientes.', 'error')
        }
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.clienteForm.identificacion ||
             this.clienteForm.nombres ||
             this.clienteForm.apellidos ||
             this.clienteForm.telefono ||
             this.clienteForm.direccion;
    },

    // 🔹 Método de limpiar campos del formulario
    limpiarCampos() {
      this.clienteForm = {
        identificacion: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        direccion: ''
      }
    },

    // 🔹 Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    // 🔹 Método para abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.cliente = this.clientes[idx]
      this.modalEliminar.visible = true
    },

    // 🔹 Método para eliminar cliente
    async eliminarCliente(idx) {
      const cliente = this.clientes[idx]

      try {
        await eliminarClientePorIdentificacion(cliente.identificacion)

        // ✅ Eliminamos solo si backend respondió bien
        this.clientes.splice(idx, 1)
        this.clientesFiltrados = [...this.clientes]

        this.mostrarMensaje(`🗑️ Cliente ${cliente.nombres} ${cliente.apellidos} eliminado correctamente.`, 'success')

      } catch (error) {
        console.error('❌ Error al eliminar cliente:', error)

        if (error.response && error.response.status === 404) {
          this.mostrarMensaje('⚠️ Cliente ${cliente.nombres} no encontrado en el servidor.', 'error')
        } else {
          this.mostrarMensaje('Error al eliminar cliente ${cliente.nombres} en el servidor.', 'error')
        }
      } finally {
        this.modalEliminar.visible = false
      }
    },

    // 🔹 Método para llamar al componente de agregar cliente
    async agregarCliente(cliente) {
      this.$router.push({
        name: 'RegistroClienteView',
        state: { cliente }
      })
    },

    // 🔹 Método para llamar al componente de actualizar cliente
    abrirActualizarCliente(cliente) {
      this.$router.push({
        name: 'ActualizarClienteView',
        params: {
          identificacion: cliente.identificacion
        }
      })
    },

    // 🔹 Método para filtrar clientes según el tipo de búsqueda
    async filtrarClientes() {
      if (!this.busqueda.trim()) {
        this.limpiarBusqueda()
        return
      }

      const texto = this.busqueda.trim()

      try {
        let response
        switch (this.tipoBusqueda) {
          case 'identificacion':
            response = await buscarClientePorIdentificacion(Number(texto)) // ✅ Identificacion como número
            break
          case 'nombres':
            response = await buscarClientePorNombres(texto)
            break
          case 'apellidos':
            response = await buscarClientePorApellidos(texto)
            break
          default:
            this.mostrarMensaje('Seleccione un tipo de búsqueda válido.', 'error')
            return
        }

        const data = response.data

        if (Array.isArray(data)) {
          this.clientesFiltrados = data
        } else if (data) {
          // backend puede devolver objeto simple
          this.clientesFiltrados = [data]
        } else {
          this.clientesFiltrados = []
        }

        if (this.clientesFiltrados.length === 0) {
          this.mostrarMensaje('No se encontraron clientes.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al filtrar clientes:', error)

        // Si es un Error construido en el interceptor lo mostramos con detalle
        if (error.message) {
          if (error.message.includes('404')) {
            this.clientesFiltrados = []
            this.mostrarMensaje('No se encontró cliente.', 'error')
          } else {
            // Intenta mostrar el mensaje del backend si vino
            this.mostrarMensaje(error.message, 'error')
          }
        } else {
          this.mostrarMensaje('Error al buscar clientes en el servidor.', 'error')
        }
      }
    },

    // 🔹 Método para limpiar búsqueda
    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = '' // 🔹 Resetea la opción del selector
      this.cargarClientes() // 🔹 Vuelve a cargar todos los clientes
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
  align-items: center;      /* o center según prefieras */
  gap: 4px;                 /* espacio entre el texto y los inputs/botones */
  margin-top: 20px;         /* espacio arriba del bloque */
  margin-bottom: 12px;      /* espacio debajo del bloque */
}

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

.update-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f4a261;
  color: white;
  border: none;
  cursor: pointer;
  margin-right: 4px;
}

.update-btn:hover {
  background: #e76f51;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.clientes-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.clientes-table th {
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

.delete-btn:hover {
  background: #b52a33;
}

.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

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
  cursor: not-allowed;
}

.buscar-btn:not(:disabled):hover {
  background: #e76f51;
}

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

.btn-yes {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #e63946;
  color: white;
}

.btn-no {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #06d6a0;
  color: white;
}

.btn-yes:hover {
  background: #b52a33;
}

.btn-no:hover {
  background: #049670;
}
</style>
