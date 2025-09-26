<!-- src/components/productos/ProductosView.vue -->

<template>
  <div class="registro-producto-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['producto-container', { expanded: menuOpen }]">
      <h1 class="titulo">Productos</h1>

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
              ⚠️ ¿Está seguro de eliminar el producto
              {{ modalEliminar.producto.nombre }}?
            </p>
            <div class="modal-buttons">
              <!-- ✅ Botón de si -->
              <button class="btn-yes"
                      @click="eliminarProducto(modalEliminar.idx)">
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
            <option disabled value="">Seleccione</option>
            <option value="codigo">Código</option>
            <option value="nombre">Nombre</option>
            <option value="descripcion">Descripción</option>
            <option value="cantidad">Cantidad</option>
            <option value="precio">Precio</option>
            <option value="proveedor">Proveedor</option>
            <option value="fechaCreacion">Fecha de Creación</option>
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
                  @click="filtrarProductos">
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
                  @click="agregarProducto">
                  ➕ Registrar Producto
          </button>
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
            <th>CANTIDAD</th>
            <th>PRECIO U.</th>
            <th>NOMBRE PROVEEDOR</th>
            <th>FECHA REGISTRO</th>
            <th>FECHA ACTUALIZACIÓN</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(prod, idx) in productosFiltrados" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ prod.codigo }}</td>
            <td>{{ prod.nombre }}</td>
            <td>{{ prod.descripcion }}</td>
            <td>{{ prod.cantidad }}</td>
            <td>{{ prod.precio }}</td>
            <td>{{ prod.proveedorName }}</td>
            <td>{{ prod.fechaCreacion }}</td> <!-- ⏰ Fecha de registro -->
            <td>{{ prod.fechaActualizacion }}</td> <!-- ⏰ Fecha actualización, inicialmente vacía -->
            <td>
              <!-- ✏️ Botón de editar -->
              <button class="update-btn"
                      @click="abrirActualizarProducto(prod)">
                      ✏️
              </button>
              <!-- 🗑️️ Botón de eliminar -->
              <button class="delete-btn"
                      @click="confirmarEliminar(idx)">
                      🗑️
              </button>
            </td>
          </tr>
          <tr v-if="productosFiltrados.length === 0">
            <td colspan="10" class="empty-row">No hay productos registrados.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import {
  listarProductos,
  buscarProductoPorCodigo,
  buscarProductoPorNombre,
  buscarProductoPorDescripcion,
  buscarProductoPorCantidad,
  buscarProductoPorPrecio,
  buscarProductoPorProveedorId,
  buscarProductoPorProveedorName,
  eliminarProductoPorCodigo
} from '@/services/apiProductsService.js'

import { listarProveedores } from '@/services/apiSuppliersService.js'

export default {
  name: 'ProductosView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      productoForm: {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedorId: '',
        proveedorName: ''
      },
      productos: [],
      productosFiltrados: [],
      proveedores: [],
      proveedoresFiltrados: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: '',
      tipoBusqueda: '',
      modalEliminar: {
        visible: false,
        idx: null,
        producto: {}
      }
    }
  },

  mounted() {
    // 🔹 Cargar todos los productos desde backend al iniciar
    this.cargarProductos()

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

    // 🔹 Método de cargar productos
    async cargarProductos() {
      try {
        const response = await listarProductos()
        this.productos = response.data
        this.productosFiltrados = [...this.productos]
      } catch (error) {
        console.error('❌ Error al cargar productos:', error)

        // Mostrar mensaje si hay respuesta del backend
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de productos.', 'error')
        }
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.productoForm.codigo ||
             this.productoForm.nombre ||
             this.productoForm.descripcion ||
             this.productoForm.cantidad ||
             this.productoForm.precio ||
             this.productoForm.proveedorName;
    },

    // 🔹 Método de limpiar campos del formulario
    limpiarCampos() {
      this.productoForm = {
        codigo: '',
        nombre: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        proveedorId: '',
        proveedorName: ''
      }
    },

    // 🔹 Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    // 🔹 Método para abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.producto = this.productos[idx]
      this.modalEliminar.visible = true
    },

    // 🔹 Método para eliminar producto
    async eliminarProducto(idx) {
      const producto = this.productos[idx]
      try {
        await eliminarProductoPorCodigo(producto.codigo)

        // ✅ Eliminamos solo si backend respondió bien
        this.productos.splice(idx, 1)
        this.productosFiltrados = [...this.productos]

        this.mostrarMensaje(`🗑️ Producto ${producto.nombre} eliminado.`, 'success')

      } catch (error) {
        console.error('❌ Error al eliminar producto:', error)
        if (error.response && error.response.status === 404) {
          this.mostrarMensaje(`⚠️ Producto ${producto.nombre} con código ${producto.codigo} no encontrado en el servidor.`, 'error')
        } else if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de productos.', 'error')
        }
      } finally {
        this.modalEliminar.visible = false
      }
    },

    // 🔹 Método para llamar al componente de agregar producto
    agregarProducto(producto) {
      this.$router.push({
        name: 'RegistroProductosView',
        state: { producto }
      })
    },

    // 🔹 Método para llamar al componente de actualizar producto
    abrirActualizarProducto(producto) {
      this.$router.push({
        name: 'ActualizarProductosView',
        params: {
          codigo: producto.codigo
        }
      })
    },

    // 🔹 Método para filtrar productos según el tipo de búsqueda
    async filtrarProductos() {
      if (!this.busqueda.trim()) {
        this.limpiarBusqueda()
        return
      }

      const texto = this.busqueda.trim()

      try {
        let response
        switch (this.tipoBusqueda) {
          case 'codigo':
            response = await buscarProductoPorCodigo(Number(texto))
            break
          case 'nombre':
            response = await buscarProductoPorNombre(texto)
            break
          case 'descripcion':
            response = await buscarProductoPorDescripcion(texto)
            break
          case 'cantidad':
            response = await buscarProductoPorCantidad(texto)
            break
          case 'precio':
            response = await buscarProductoPorPrecio(texto)
            break
          case 'proveedor':
            if (!isNaN(texto)) {
              response = await buscarProductoPorProveedorId(Number(texto))
            } else {
              response = await buscarProductoPorProveedorName(texto)
            }
            break
          default:
            this.mostrarMensaje('Seleccione un tipo de búsqueda válido.', 'error')
            return
        }

        const data = response.data

        if (Array.isArray(data)) {
          this.productosFiltrados = data
        } else if (data) {
          // backend puede devolver objeto simple
          this.productosFiltrados = [data]
        } else {
          this.productosFiltrados = []
        }

        if (this.productosFiltrados.length === 0) {
          this.mostrarMensaje('No se encontraron productos.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al filtrar productos:', error)

        // Si es un Error construido en el interceptor lo mostramos con detalle
        if (error.mensaje) {
          if(error.mensaje.includes('404')) {
            this.productosFiltrados = []
            this.mostrarMensaje('No se encontró producto', 'error')
          } else {
            // Intenta mostrar el mensaje del backend si vino
            this.mostrarMensaje(error.mensaje, 'error')
          }
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de productos.', 'error')
        }
      }
    },

    // 🔹 Método para limpiar búsqueda
    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = '' // 🔹 Resetea la opción del selector
      this.cargarProductos() // 🔹 Vuelve a cargar todos los productos
    },

    // 🔹 Método para cargar proveedores
    async cargarProveedores() {
      try {
        const response = await listarProveedores()
        this.proveedores = response.data
        this.proveedoresFiltrados = [...this.proveedores]
      } catch (error) {
        console.error('❌ Error al cargar proveedores:', error)
        if (error.response && error.response.data) {
          this.mostrarMensaje(`Error: ${error.response.data}`, 'error')
        } else {
          this.mostrarMensaje('Error al conectarse con el servidor de proveedores.', 'error')
        }
      }
    }
  }
}
</script>

<style scoped>
.registro-producto-wrapper {
  display: flex;
}

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

.producto-container.expanded {
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

select {
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
  margin-left: auto;        /* empuja el botón a la derecha */
  display: block;           /* asegura que se respete el auto margin */
}

.update-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 8px;         /* De aqui al final del boton era otro */
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
  padding: 6px 12px;        /* De aqui al final del boton era otro */
  background: #06d6a0;
  color: white;
  margin-left: 4px;
}

.agregar-btn:hover {
  background: #005f8a;
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

.productos-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.productos-table th {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.productos-table td {
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
