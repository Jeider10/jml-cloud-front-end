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

      <!-- Formulario cliente -->
      <div class="form-container">
        <div class="form-row">
          <label for="identificación">Identificación</label>
          <input v-model="clienteForm.identificacion" type="text" />

          <label for="nombres">Nombres</label>
          <input v-model="clienteForm.nombres" type="text" />

          <label for="apellidos">Apellidos</label>
          <input v-model="clienteForm.apellidos" type="text" />

          <label for="teléfono">Teléfono</label>
          <input v-model="clienteForm.telefono" type="text" />

          <label for="dirección">Dirección</label>
          <input v-model="clienteForm.direccion" type="text" />

          <!-- ➕ Botón de registrar -->
          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="agregarCliente">
            ➕ Registrar
          </button>

          <!-- 🧹 Botón de limpiar campos -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
            🧹 Limpiar campos
          </button>

          <!-- ↩️ Botón de volver -->
          <button type="button"
                  class="volver-btn"
                  @click="volverClientes">
            ↩️ Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { crearCliente } from '@/services/apiCustomerService.js'

export default {
  name: 'RegistroClienteView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: localStorage.getItem('menuPinned') === 'true', // Siempre arranca expandido y false arranca oculto
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
    // this.cargarClientes()
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

        // 🔹 Solo redirige si es un mensaje de éxito
        if (tipo === 'success') {
          this.$router.push({ name: 'ClientesView' })
        }
      }, 3000)
    },

    // 🔹 Método de agregar cliente
    async agregarCliente() {
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

      // 🔍 Verificar si ya existe un cliente con la misma identificación en la lista local
      const existente = this.clientes.find(c => c.identificacion === this.clienteForm.identificacion)
      if (existente) {
        this.mostrarMensaje(`⚠️ Ya existe un cliente con esta Identificación (${existente.identificacion}): ${existente.nombres} ${existente.apellidos}.`, 'error')
        return
      }

      try {
        // Llamada al backend
        const response = await crearCliente(this.clienteForm)
        const nuevoCliente = response.data

        // Agregamos el cliente retornado por el backend a la lista local
        this.clientes.push(nuevoCliente)
        this.clientesFiltrados = [...this.clientes]

        this.mostrarMensaje(`✅ Cliente ${nuevoCliente.nombres} ${nuevoCliente.apellidos} registrado correctamente.`, 'success')

        // limpiar formulario
        this.limpiarCampos();
      } catch (error) {
        this.manejarErrorApiClienteRegistrar(error, `registrar cliente ${this.clienteForm.nombres}`)
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

    // 🔹 Método para volver a clientes
    volverClientes() {
      this.$router.push({ name: 'ClientesView' })
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiClienteRegistrar(error, contexto = '') {
      console.error(`❌ Error en ${contexto || 'operación'}:`, error)

      // 🔴 Caso 1: Error con respuesta del servidor
      if (error.response) {
        const status = error.response.status

        switch (status) {
          case 400:
            this.mostrarMensaje('⚠️ Solicitud incorrecta. Revisa los parámetros enviados.', 'warning')
            break
          case 401:
            this.mostrarMensaje('🚫 No autorizado. Inicia sesión nuevamente.', 'error')
            break
          case 403:
            this.mostrarMensaje('🔒 Acceso denegado. No tienes permisos para esta acción.', 'error')
            break
          case 404:
            this.mostrarMensaje('⚠️ Recurso no encontrado en el servidor.', 'warning')
            break
          case 409:
            this.mostrarMensaje('⚠️ Conflicto con el recurso. Puede estar siendo utilizado.', 'warning')
            break
          case 500:
            this.mostrarMensaje('💥 Error interno en el servidor. Inténtalo más tarde.', 'error')
            break
          default:
            this.mostrarMensaje(`⚠️ ${error.response?.data?.message || 'Error desconocido en el servidor.'}`, 'error')
        }

        // 🌐 Caso 2: No hay conexión o CORS bloqueado
      } else if (error.request) {
        this.mostrarMensaje('🌐 No se pudo conectar con el servidor. Verifica tu conexión.', 'error')

        // ⚙️ Caso 3: Error inesperado en frontend
      } else {
        this.mostrarMensaje(`⚠️ Error inesperado: ${error.message}`, 'error')
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
  margin-bottom: 10px;
  text-align: center;
  margin-top: 1px;    /* espacio desde arriba */
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
  color: #0b2e13;
}

.mensaje.warning {
  background: #f1c40f;
  color: #333;
}

.mensaje.error {
  background: #e74c3c;
  color: #2b0500;
}

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

label {
  font-weight: bold;
}

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.agregar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.agregar-btn:hover {
  background: #005f8a;
}

.agregar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-campos-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #f4a261;
  color: #1a1a1a;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.limpiar-campos-btn:hover {
  background: #049670;
}

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-campos-btn:not(:disabled):hover {
  background: #e76f51;
}

.volver-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.volver-btn:hover {
  background: #005f8a;
}
</style>
