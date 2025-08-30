<!-- src/components/proveedores/RegistroProductosView.vue -->

<template>
  <div class="registro-producto-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['producto-container', { expanded: menuOpen }]">
      <h1 class="titulo">Registro Producto</h1>

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
            <p>⚠️ ¿Está seguro de eliminar el producto {{ modalEliminar.producto.nombre }}?</p>
            <div class="modal-buttons">
              <button class="btn-yes" @click="eliminarProducto(modalEliminar.idx)">Sí</button>
              <button class="btn-no" @click="modalEliminar.visible = false">No</button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Formulario producto -->
      <div class="form-container">
        <div class="form-row">
          <label>Código:</label>
          <input v-model="productoForm.codigo" type="text" />

          <label>Nombre:</label>
          <input v-model="productoForm.nombre" type="text" />

          <label>Descripción:</label>
          <input v-model="productoForm.descripcion" type="text" />

          <label>Cantidad:</label>
          <input v-model="productoForm.cantidad" type="number" />

          <label>Precio:</label>
          <input v-model="productoForm.precio" type="number" step="0.01" />

          <label>Proveedor:</label>
          <select v-model="productoForm.proveedor">
            <option v-for="p in proveedores" :key="p.nic" :value="p.nombre">{{ p.nombre }}</option>
          </select>

          <button type="button"
                  class="agregar-btn"
                  :disabled="!hayDatos()"
                  @click="agregarProducto">
            ➕ Registrar
          </button>

          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
            🧹 Limpiar campos
          </button>
        </div>

        <!-- 🔍 Filtro de búsqueda -->
        <div class="form-filtro">
          <span style="font-weight: bold;">Buscar por Código, Nombre o Descripción:</span>
          <div style="display: flex; gap: 4px;">
            <input v-model="busqueda" type="text" placeholder="Ingrese término de búsqueda" />
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro()"
                    @click="filtrarProductos">Buscar</button>
            <button type="button"
                    class="buscar-btn"
                    :disabled="!hayDatosFiltro()"
                    @click="limpiarBusqueda">Limpiar</button>
          </div>
        </div>
      </div>

      <!-- Tabla de productos -->
      <table class="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>CÓDIGO</th>
            <th>NOMBRE</th>
            <th>DESCRIPCIÓN</th>
            <th>PROVEEDOR</th>
            <th>STOCK</th>
            <th>PRECIO U.</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(prod, idx) in productosFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ prod.codigo }}</td>
            <td>{{ prod.nombre }}</td>
            <td>{{ prod.descripcion }}</td>
            <td>{{ prod.proveedor }}</td>
            <td>{{ prod.cantidad }}</td>
            <td>{{ prod.precio }}</td>
            <td>
              <button class="update-btn" @click="abrirActualizarProducto(prod)">✏️</button>
              <button class="delete-btn" @click="confirmarEliminar(idx)">🗑️</button>
            </td>
          </tr>
          <tr v-if="productosFiltrados.length === 0">
            <td colspan="8" class="empty-row">No hay productos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'RegistroProductosView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      productoForm: {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedor: ''
      },
      productos: [],
      productosFiltrados: [],
      proveedores: JSON.parse(localStorage.getItem('proveedores')) || [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: '',
      modalEliminar: {
        visible: false,
        idx: null,
        producto: {}
      }
    }
  },
  mounted() {
    this.productos = JSON.parse(localStorage.getItem('productos')) || []
    this.productosFiltrados = [...this.productos]
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

    agregarProducto() {
      if (!this.productoForm.codigo || !this.productoForm.nombre || !this.productoForm.descripcion) {
        this.mostrarMensaje('Código, nombre y descripción son obligatorios.', 'error')
        return
      }

      const existente = this.productos.find(p => p.codigo === this.productoForm.codigo)
      if (existente) {
        this.mostrarMensaje(`⚠️ Ya existe un producto con este código (${existente.codigo}).`, 'error')
        return
      }

      const nuevo = { ...this.productoForm }
      this.productos.push(nuevo)
      localStorage.setItem('productos', JSON.stringify(this.productos))
      this.productosFiltrados = [...this.productos]

      this.mostrarMensaje(`✅ Producto ${this.productoForm.nombre} registrado correctamente.`, 'success')

      this.limpiarCampos()
    },

    hayDatos() {
      return this.productoForm.codigo || this.productoForm.nombre || this.productoForm.descripcion || this.productoForm.cantidad || this.productoForm.precio || this.productoForm.proveedor
    },

    limpiarCampos() {
      this.productoForm = { codigo: '', nombre: '', descripcion: '', cantidad: 0, precio: 0, proveedor: '' }
    },

    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    filtrarProductos() {
      const texto = this.busqueda.toLowerCase()
      this.productosFiltrados = this.productos.filter(p =>
        p.codigo.toLowerCase().includes(texto) ||
        p.nombre?.toLowerCase().includes(texto) ||
        p.descripcion.toLowerCase().includes(texto)
      )
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.productosFiltrados = [...this.productos]
    },

    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.producto = this.productos[idx]
      this.modalEliminar.visible = true
    },

    eliminarProducto(idx) {
      const eliminado = this.productos[idx]
      this.productos.splice(idx, 1)
      localStorage.setItem('productos', JSON.stringify(this.productos))
      this.productosFiltrados = [...this.productos]
      this.mostrarMensaje(`🗑️ Producto ${eliminado.nombre} eliminado.`, 'error')
      this.modalEliminar.visible = false
    },

    abrirActualizarProducto(producto) {
      localStorage.setItem('productoActualizar', JSON.stringify(producto))
      this.$router.push({ name: 'ActualizarProductosView' })
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
input, select { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
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
.buscar-btn { padding: 6px 12px; background: #06d6a0; color: white; margin-left: 4px; }
.buscar-btn:hover { background: #049670; }
.buscar-btn:disabled { background: #ccc; cursor: not-allowed; }
.productos-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.productos-table th, .productos-table td { border: 1px solid #ddd; padding: 8px; text-align: center; background: white; }
.empty-row { text-align: center; padding: 18px; color: #666; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; }
.modal-content { background: white; padding: 20px 30px; border-radius: 8px; text-align: center; min-width: 300px; box-shadow: 0px 8px 16px rgba(0,0,0,0.25); }
.modal-buttons { margin-top: 15px; display: flex; justify-content: center; gap: 15px; }
.btn-yes { padding: 6px 12px; background: #e63946; color: white; }
.btn-yes:hover { background: #b52a33; }
.btn-no { padding: 6px 12px; background: #06d6a0; color: white; }
.btn-no:hover { background: #049670; }
</style>
