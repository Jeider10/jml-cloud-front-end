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
          <label>CÓDIGO SUCURSAL</label>
          <input v-model="proveedorForm.codigoSucursal" type="text" disabled />

          <label>Nombre</label>
          <input v-model="proveedorForm.nombre" type="text" />

          <label>Teléfono</label>
          <input v-model="proveedorForm.telefono" type="text" />

          <label>Dirección</label>
          <input v-model="proveedorForm.direccion" type="text" />

          <label>Correo</label>
          <input v-model="proveedorForm.correo" type="text" />

          <!-- 💾 Botón de actualizar -->
          <button type="button"
                  class="agregar-btn"
                  @click="actualizarProveedor">
                  💾 Actualizar
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
import { actualizarProveedor, buscarProveedorPorCodigoSucursal } from '@/services/apiSuppliersService.js'

export default {
  name: 'ActualizarProveedorView',
  components: { DashboardSideMenu },
  props: ['codigoSucursal'],
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
      mensaje: '',
      mensajeTipo: ''
    }
  },

  async mounted() {
    // 🔹 Cargar proveedor específico desde backend por codigoSucursal
    await this.cargarProveedor()
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

    // 🔹 Método de agregar un proveedor por códigoSucursal
    async cargarProveedor() {
      try {
        const response = await buscarProveedorPorCodigoSucursal(this.codigoSucursal)
        if (response.data) {
          this.proveedorForm = { ...response.data } // ✅ llena el form directamente
        }
      } catch (error) {
        console.error('❌ Error al cargar proveedor:', error)

        if (error.response && error.response.status === 404) {
          this.mostrarMensaje(`Proveedor no encontrado con códigoSucursal ${this.codigoSucursal}`, 'error')
        } else if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de proveedores.', 'error')
        }
      }
    },

    // 🔹 Método para actualizar proveedor en backend
    async actualizarProveedor() {
      if (
        !this.proveedorForm.codigoSucursal ||
        !this.proveedorForm.nombre ||
        !this.proveedorForm.telefono ||
        !this.proveedorForm.direccion ||
        !this.proveedorForm.correo
      ) {
        this.mostrarMensaje('Código sucursal, nombre, teléfono, dirección y correo son obligatorios.', 'error')
        return
      }

      try {
        const response = await actualizarProveedor(this.proveedorForm)
        const actualizado = response.data

        this.mostrarMensaje(`✅ Proveedor ${actualizado.nombre} actualizado correctamente.`, 'success')

      } catch (error) {
        console.error('❌ Error al actualizar proveedor:', error)
        this.mostrarMensaje(error.message || 'Error al actualizar el proveedor.', 'error')
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
  margin-bottom: 20px;
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
