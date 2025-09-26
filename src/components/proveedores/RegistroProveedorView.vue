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

      <!-- Formulario proveedor -->
      <div class="form-container">
        <div class="form-row">
          <label>Codigo Sucursal</label>
          <input v-model="proveedorForm.codigoSucursal" type="text" />

          <label>Nombre</label>
          <input v-model="proveedorForm.nombre" type="text" />

          <label>Teléfono</label>
          <input v-model="proveedorForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="proveedorForm.direccion" type="text" />

          <label>Correo</label>
          <input v-model="proveedorForm.correo" type="text" />

          <!-- ➕ Botón de registrar -->
          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="agregarProveedor">
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
                  @click="volverProveedores">
                  ↩️ Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { crearProveedor } from '@/services/apiSuppliersService.js'

export default {
  name: 'RegistroProveedorView',
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
    // this.cargarProveedores()
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
          this.$router.push({ name: 'ProveedoresView' })
        }
      }, 3000)
    },

    // 🔹 Método de agregar proveedor
    async agregarProveedor() {
      if (!this.proveedorForm.codigoSucursal) {
        this.mostrarMensaje('Ingrese el código de la sucursal.', 'error')
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
      const existente = this.proveedores.find(p => p.codigoSucursal === Number(this.proveedorForm.codigoSucursal))
      if (existente) {
        this.mostrarMensaje(`⚠️ Ya existe un proveedor: ${existente.nombre} con este Código de Sucursal (${existente.codigoSucursal}).`, 'error')
        return
      }

      try {
        // 🔹 Llamada al backend (codigoSucursal convertido a número)
        const payload = {
          ...this.proveedorForm,
          codigoSucursal: Number(this.proveedorForm.codigoSucursal)
        }

        const response = await crearProveedor(payload)
        const nuevoProveedor = response.data

        // 🔹 Agregamos el proveedor retornado por el backend a la lista local
        this.proveedores.push(nuevoProveedor)
        this.proveedoresFiltrados = [...this.proveedores]

        this.mostrarMensaje(`✅ Proveedor ${nuevoProveedor.nombre} registrado correctamente.`, 'success')

        // limpiar formulario
        this.limpiarCampos();
      } catch (error) {
        console.error('❌ Error al crear proveedor:', error)
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al crear proveedor en el servidor.', 'error')
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

    // 🔹 Método para volver a registro de proveedores
    volverProveedores() {
      this.$router.push({ name: 'ProveedoresView' })
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
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;        /* De aqui al final del boton era otro */
  background: #0077b6;
  color: white;
}

.limpiar-campos-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;        /* De aqui al final del boton era otro */
  background: #f4a261;
  color: white;
}

.agregar-btn:hover {
  background: #005f8a;
}

.agregar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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
