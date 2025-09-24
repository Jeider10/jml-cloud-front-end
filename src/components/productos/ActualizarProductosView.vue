<!-- src/components/proveedores/ActualizarProductoView.vue -->

<template>
  <div class="registro-producto-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['producto-container', { expanded: menuOpen }]">
      <h1 class="titulo">Actualizar Producto</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario producto -->
      <div class="form-container">
        <div class="form-row">
          <label>Código</label>
          <input v-model="productoForm.codigo" type="text" disabled />

          <label>Nombre</label>
          <input v-model="productoForm.nombre" type="text" />

          <label>Descripción</label>
          <input v-model="productoForm.descripcion" type="text" />

          <label>Cantidad</label>
          <input v-model="productoForm.cantidad" type="number" />

          <label>Precio U.</label>
          <input v-model="productoForm.precio" type="number" step="0.01" />

          <label>Proveedor</label>
          <div class="form-group">
            <select v-model="productoForm.proveedorId" @change="actualizarProveedorName" class="form-control">
              <option disabled value="">Seleccione un proveedor</option>
              <option v-for="p in proveedores" :key="p.id" :value="p.id">
                {{ p.nombre }}
              </option>
            </select>
          </div>

          <!-- Botón Actualizar -->
          <button type="button" class="agregar-btn" @click="actualizarProductoEnServidor">
            💾 Actualizar
          </button>

          <!-- Botón Volver -->
          <button type="button" class="volver-btn" @click="volverRegistro">
            ↩️ Volver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { listarProveedores } from '@/services/apiSuppliersService.js'
import { actualizarProducto, buscarProductoPorCodigo } from '@/services/apiProductsService.js'

export default {
  name: 'ActualizarProductoView',
  components: { DashboardSideMenu },
  props: ['codigo'],
  data() {
    return {
      menuOpen: false,
      productoForm: {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedorId: null,
        proveedorName: ''
      },
      mensaje: '',
      mensajeTipo: '',
      proveedores: [] // cada item tendrá al menos { id, nombre }
    }
  },
  async mounted() {
    // 1. Cargar proveedores
    await this.cargarProveedores()

    // 2. Cargar producto desde backend usando el código de la ruta
    await this.cargarProducto()
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

    // 🔹 Cargar lista de proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores()
        this.proveedores = response.data.map(p => ({
          id: String(p.codigoSucursal),
          nombre: p.nombre
        }))
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

    // 🔹 Cargar producto y normalizar proveedorId
    async cargarProducto() {
      try {
        const response = await buscarProductoPorCodigo(this.codigo)
        if (response.data) {
          const data = response.data
          this.productoForm = {
            codigo: data.codigo,
            nombre: data.nombre,
            descripcion: data.descripcion,
            cantidad: data.cantidad,
            precio: data.precio,
            proveedorId: data.proveedorId ? String(data.proveedorId) : '',
            proveedorName: data.proveedorName || ''
          }
        }
      } catch (error) {
        console.error('❌ Error al cargar producto:', error)
        this.mostrarMensaje('Error al cargar producto.', 'error')
      }
    },

    // 🔹 Actualizar producto en backend
    async actualizarProductoEnServidor() {
      if (!this.productoForm.codigo || !this.productoForm.nombre || !this.productoForm.descripcion) {
        this.mostrarMensaje('Código, nombre y descripción son obligatorios.', 'error')
        return
      }
      if (!this.productoForm.proveedorId) {
        this.mostrarMensaje('Seleccione un proveedor.', 'error')
        return
      }

      try {
        // buscar nombre del proveedor seleccionado a partir del ID
        const proveedorSel = this.proveedores.find(p => p.id === this.productoForm.proveedorId)
        this.productoForm.proveedorName = proveedorSel ? proveedorSel.nombre : this.productoForm.proveedorName

        // preparar payload
        const payload = {
          codigo: this.productoForm.codigo,
          nombre: this.productoForm.nombre,
          descripcion: this.productoForm.descripcion,
          cantidad: this.productoForm.cantidad,
          precio: this.productoForm.precio,
          proveedorId: Number(this.productoForm.proveedorId),
          proveedorName: this.productoForm.proveedorName
        }

        await actualizarProducto(payload)

        this.mostrarMensaje(`Producto ${this.productoForm.nombre} actualizado correctamente.`, 'success')

        // Volver a la vista principal
        setTimeout(() => {
          this.$router.push({ name: 'RegistroProductosView' })
        }, 1200)
      } catch (error) {
        console.error('❌ Error al actualizar producto:', error)
        this.mostrarMensaje('Error al actualizar producto en el servidor.', 'error')
      }
    },

    // ↩️ Volver a registro de productos
    volverRegistro() {
      // Si quieres simplemente volver al listado por nombre de ruta:
      this.$router.push({ name: 'ProductosView' })

      // Si prefieres volver una página en el historial del navegador:
      // this.$router.go(-1)
    }
  }
}
</script>



<style scoped>
.registro-producto-wrapper { display: flex; }

.producto-container {
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

.producto-container.expanded { left: 220px; }

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

input, select { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }

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
