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
          <input v-model="productoForm.codigo" type="text" />

          <label>Nombre</label>
          <input v-model="productoForm.nombre" type="text" />

          <label>Descripción</label>
          <input v-model="productoForm.descripcion" type="text" />

          <label>Proveedor</label>
          <select v-model="productoForm.proveedor">
            <option v-for="p in proveedores" :key="p.nic" :value="p.nombre">{{ p.nombre }}</option>
          </select>

          <label>Stock</label>
          <input v-model="productoForm.cantidad" type="number" />

          <label>Precio</label>
          <input v-model="productoForm.precio" type="number" step="0.01" />

          <button type="button" class="agregar-btn" @click="actualizarProducto">
            💾 Actualizar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'ActualizarProductoView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      productoForm: {
        codigo: '',
        nombre: '',
        descripcion: '',
        proveedor: '',
        cantidad: 0,
        precio: 0
      },
      mensaje: '',
      mensajeTipo: '',
      codigoOriginal: '', // para rastrear el código original
      proveedores: JSON.parse(localStorage.getItem('proveedores')) || []
    }
  },
  mounted() {
    const producto = JSON.parse(localStorage.getItem('productoActualizar'))
    if (producto) {
      this.productoForm = { ...producto }
      this.codigoOriginal = producto.codigo // guardamos el código original
    }
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

    actualizarProducto() {
      if (!this.productoForm.codigo || !this.productoForm.nombre || !this.productoForm.descripcion) {
        this.mostrarMensaje('Código, nombre y descripción son obligatorios.', 'error')
        return
      }

      const productos = JSON.parse(localStorage.getItem('productos')) || []

      // Verificamos si el código ya existe en otro producto
      const duplicado = productos.find(p => p.codigo === this.productoForm.codigo && p.codigo !== this.codigoOriginal)
      if (duplicado) {
        this.mostrarMensaje(`⚠️ Ya existe un producto con este código (${duplicado.codigo}).`, 'error')
        return
      }

      const idx = productos.findIndex(p => p.codigo === this.codigoOriginal)
      if (idx !== -1) {
        // Actualizamos datos
        productos[idx] = { ...productos[idx], ...this.productoForm }
        localStorage.setItem('productos', JSON.stringify(productos))

        this.mostrarMensaje(`Producto ${this.productoForm.nombre} actualizado correctamente.`, 'success')

        // Volver automáticamente a la vista de registro después de 2 segundos
        setTimeout(() => {
          this.$router.push({ name: 'RegistroProductosView' })
        }, 2000)
      }
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
.agregar-btn:hover { background: #005f8a; }
</style>
