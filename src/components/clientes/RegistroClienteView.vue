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
        console.error('❌ Error al crear cliente:', error)
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al crear cliente en el servidor.', 'error')
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

    // 🔹 Método para volver a clientes
    volverClientes() {
      this.$router.push({ name: 'ClientesView' })
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
  cursor: not-allowed;
}

.agregar-btn:not(:disabled):hover {
  background: #e76f51;
}

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
  cursor: not-allowed;
}

.limpiar-campos-btn:not(:disabled):hover {
  background: #e76f51;
}

.volver-btn {
  padding: 8px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.volver-btn:hover {
  background: #005f8a;
}
</style>
