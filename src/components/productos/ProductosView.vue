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
              <button class="btn-yes" @click="eliminarProducto(modalEliminar.idx)">
                Sí
              </button>

              <!-- ❌️ Botón de no -->
              <button class="btn-no" @click="modalEliminar.visible = false">
                No
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 🔍 Filtro de búsqueda -->
      <div class="form-filtro">
        <!-- Texto descriptivo -->
        <!-- <span style="font-weight: bold;">Buscar por:</span> -->
        <span class="buscar-label">Buscar por:</span>

        <!-- Nuevo: selector + input + botones -->
        <div style="display: flex; gap: 4px;">
          <select v-model="tipoBusqueda">
            <option disabled value="">Seleccione una opción</option>
            <option value="codigo">Código</option>
            <option value="nombre">Nombre</option>
            <option value="referencia">Referencia</option>
            <option value="descripcion">Descripción</option>
            <option value="marca">Marca</option>
            <option value="unidadMedida">Unidad de Medida</option>
            <option value="cantidad">Cantidad</option>
            <option value="precio">Precio</option>
            <option value="proveedor">Proveedor</option>
            <option value="fechaCreacion">Fecha de Creación</option>
          </select>

          <!-- 🔍 Termino de busqueda (oculto cuando es fecha) -->
          <input v-if="tipoBusqueda !== 'fechaCreacion'" v-model="busqueda" type="text" placeholder="Ingrese termino de busqueda" :disabled="!tipoBusqueda" />

          <!-- 📅 Selector de rango de fecha estilo CloudWatch -->
          <DateRangePicker v-if="tipoBusqueda === 'fechaCreacion'" @aplicar="onFechaRangoAplicar" />

          <!-- 🔍 Boton de busqueda -->
          <button type="button" class="buscar-btn" :disabled="!puedeFiltrarse"
                  @click="filtrarProductos">
            🔍 Buscar
          </button>

          <!-- 🧹 Boton de limpiar busqueda -->
          <button type="button" class="limpiar-btn" :disabled="!puedeFiltrarse && tipoBusqueda !== 'fechaCreacion'"
                  @click="limpiarBusqueda">
            🧹 Limpiar
          </button>

          <!-- ➕ Botón de registrar producto -->
          <button type="button" class="registrar-btn" @click="agregarProducto">
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
          <th>REFERENCIA</th>
          <th>DESCRIPCIÓN</th>
          <th>MARCA</th>
          <th>U. DE MEDIDA</th>
          <th>CANTIDAD</th>
          <th>PRECIO</th>
          <th>PROVEEDOR</th>
          <th>FECHA CREACIÓN</th>
          <th>FECHA ACTUALIZACIÓN</th>
          <th>ACCIONES</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(prod, idx) in productosFiltrados" :key="idx">
          <td>{{ idx + 1 }}</td>
          <td>{{ prod.codigo }}</td>
          <td>{{ prod.nombre }}</td>
          <td>{{ prod.referencia }}</td>
          <td>{{ prod.descripcion }}</td>
          <td>{{ prod.marca }}</td>
          <td>{{ prod.unidadMedida }}</td>
          <td>{{ prod.cantidad }}</td>
          <td>{{ formatPrecioCOP(prod.precio) }}</td>
          <td>{{ prod.proveedorName }}</td>
          <td>{{ prod.fechaCreacion }}</td>
          <td>{{ prod.fechaActualizacion }}</td>
          <td>

            <!-- ✏️ Botón de editar -->
            <button class="update-btn" title="Editar" @click="abrirActualizarProducto(prod)">
              ✏️
            </button>

            <!-- 🗑️️ Botón de eliminar -->
            <button class="delete-btn" title="Eliminar" @click="confirmarEliminar(idx)">
              🗑️
            </button>
          </td>
        </tr>

        <tr v-if="productosFiltrados.length === 0">
          <td colspan="13" class="empty-row">No hay productos registrados.</td>
        </tr>

        </tbody>
      </table>
    </div>
  </div>
</template>


<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'

import {
  listarProductos,
  buscarProductoPorCodigo,
  buscarProductoPorNombre,
  buscarProductoPorReferencia,
  buscarProductoPorDescripcion,
  buscarProductoPorMarca,
  buscarProductoPorUnidadDeMedida,
  buscarProductoPorCantidad,
  buscarProductoPorPrecio,
  buscarProductoPorProveedorName,
  buscarProductoPorFechaCreacion,
  eliminarProductoPorCodigo
} from '@/services/apiProductsService.js'

import { listarProveedores } from '@/services/apiSuppliersService.js'

export default {
  name: 'ProductosView',
  components: { DashboardSideMenu, DateRangePicker },
  data() {
    return {
      menuOpen: localStorage.getItem('menuPinned') === 'true', // Siempre arranca expandido y false arranca oculto
      productoForm: {
        codigo: '',
        nombre: '',
        referencia: '',
        descripcion: '',
        marca: '',
        unidadMedida: '',
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
      fechaRango: { fechaInicio: '', fechaFin: '' },
      modalEliminar: {
        visible: false,
        idx: null,
        producto: {}
      }
    }
  },

  computed: {
    puedeFiltrarse() {
      if (!this.tipoBusqueda) return false
      if (this.tipoBusqueda === 'fechaCreacion') {
        return this.fechaRango.fechaInicio !== '' && this.fechaRango.fechaFin !== ''
      }
      return this.busqueda.trim().length > 0
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

        // 🟡 Caso 1: No hay productos (HTTP 204)
        if (response.status === 204) {
          this.productos = []
          this.productosFiltrados = []
          this.mostrarMensaje('⚠️ No se encontraron productos en el sistema.', 'warning')
          return
        }

        // 🟢 Caso 2: Productos cargados exitosamente
        this.productos = response.data
        this.productosFiltrados = [...this.productos]

        this.mostrarMensaje(`✅ ${this.productos.length} producto${this.productos.length === 1 ? '' : 's'} cargado${this.productos.length === 1 ? '' : 's'} correctamente.`, 'success')

      } catch (error) {
        this.manejarErrorApiProductos(error, 'cargar productos')
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
        this.manejarErrorApiProductos(error, `eliminar producto ${producto.nombre}`)
      } finally {
        // 🧹 Siempre cerramos el modal de confirmación
        this.modalEliminar.visible = false
      }
    },

    // 🔹 Metodo para filtrar productos segun el tipo de busqueda
    async filtrarProductos() {
      // Caso especial: busqueda por fecha
      if (this.tipoBusqueda === 'fechaCreacion') {
        return this.filtrarProductosPorFecha()
      }

      const termino = this.busqueda.trim()
      if (!termino || !this.tipoBusqueda) {
        this.mostrarMensaje('⚠️ Por favor, seleccione un tipo de busqueda y un termino.', 'error')
        return
      }

      try {
        const response = await this.obtenerProductosSegunTipo(termino)

        console.log('📦 Respuesta del backend:', response)

        // ✅ Producto(s) no encontrado(s)
        if (response.status === 204) {
          this.productosFiltrados = []
          this.mostrarMensaje(`❌ No se encontraron productos con ${this.tipoBusqueda}: ${termino}`, 'warning')
          return
        }

        // ✅ Producto(s) encontrado(s)
        if (response.data) {
          if (Array.isArray(response.data)) {
            this.productosFiltrados = response.data
          } else {
            this.productosFiltrados = [response.data]
          }
          this.mostrarMensaje(`✅ Producto${Array.isArray(response.data) && response.data.length > 1 ? 's' : ''} encontrado${Array.isArray(response.data) && response.data.length > 1 ? 's' : ''} correctamente.`, 'success')
          return
        }

        // ⚠️ Caso defensivo (nunca debería entrar aquí)
        this.productosFiltrados = []
        this.mostrarMensaje(`❌ No se encontró producto con ${this.tipoBusqueda}: ${termino}`, 'warning')

      } catch (error) {
        this.manejarErrorApiProductos(error, 'filtrar productos')
      }
    },

    // 🔹 Metodo auxiliar para filtro de productos
    async obtenerProductosSegunTipo(termino) {
      switch (this.tipoBusqueda) {
        case 'codigo':
          return await buscarProductoPorCodigo(termino)
        case 'nombre':
          return await buscarProductoPorNombre(termino)
        case 'referencia':
          return await buscarProductoPorReferencia(termino)
        case 'descripcion':
          return await buscarProductoPorDescripcion(termino)
        case 'marca':
          return await buscarProductoPorMarca(termino)
        case 'unidadMedida':
          return await buscarProductoPorUnidadDeMedida(termino)
        case 'cantidad':
          return await buscarProductoPorCantidad(termino)
        case 'precio':
          return await buscarProductoPorPrecio(termino)
        case 'proveedor':
          return await buscarProductoPorProveedorName(termino)
        default:
          this.mostrarMensaje('⚠️ Tipo de busqueda no valido.', 'error')
          return
      }
    },

    // 🔹 Callback del DateRangePicker
    onFechaRangoAplicar(rango) {
      this.fechaRango = rango
      // Auto-buscar al aplicar el rango
      this.filtrarProductosPorFecha()
    },

    // 🔹 Metodo para filtrar productos por rango de fecha de creacion
    async filtrarProductosPorFecha() {
      try {
        const inicio = this.fechaRango.fechaInicio
        const fin = this.fechaRango.fechaFin

        if (!inicio || !fin) {
          this.mostrarMensaje('⚠️ Seleccione un rango de fechas.', 'error')
          return
        }

        const response = await buscarProductoPorFechaCreacion(inicio, fin)

        if (response.status === 204) {
          this.productosFiltrados = []
          this.mostrarMensaje('❌ No se encontraron productos en el rango de fechas seleccionado.', 'warning')
          return
        }

        if (response.data) {
          this.productosFiltrados = Array.isArray(response.data) ? response.data : [response.data]
          this.mostrarMensaje('✅ ' + this.productosFiltrados.length + ' producto(s) encontrado(s) en el rango de fechas.', 'success')
        }

      } catch (error) {
        this.manejarErrorApiProductos(error, 'filtrar productos por fecha')
      }
    },

    // 🔹 Método para abrir modal en vez de window.confirm
    confirmarEliminar(idx) {
      this.modalEliminar.idx = idx
      this.modalEliminar.producto = this.productos[idx]
      this.modalEliminar.visible = true
    },

    // 🔹 Método para saber si hay datos en el cuadro de filtro
    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.productoForm.codigo ||
          this.productoForm.nombre ||
          this.productoForm.referencia ||
          this.productoForm.descripcion ||
          this.productoForm.marca ||
          this.productoForm.unidadMedida ||
          this.productoForm.cantidad ||
          this.productoForm.precio ||
          this.productoForm.proveedorName;
    },

    // 🔹 Método de limpiar campos del formulario
    limpiarCampos() {
      this.productoForm = {
        codigo: '',
        nombre: '',
        referencia: '',
        descripcion: '',
        marca: '',
        unidadMedida: '',
        cantidad: 0,
        precio: 0,
        proveedorId: '',
        proveedorName: ''
      }
    },

    // 🔹 Metodo para limpiar busqueda
    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = ''
      this.fechaRango = { fechaInicio: '', fechaFin: '' }
      this.cargarProductos()
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
    },

    // 🔹 Método para manejar formato de precios
    formatPrecioCOP(valor) {
      if (valor === null || valor === undefined) return '$0'

      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor)
    },

    // 🔹 Método para manejar errores de API
    manejarErrorApiProductos(error, contexto = '') {
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
  margin-bottom: 10px;
  text-align: center;
  /* espacio desde arriba */
  margin-top: -10px;
}

.buscar-label {
  /* para que respete el margen como línea */
  display: block;
  /* sube el texto hacia arriba */
  margin-top: -20px;
  font-weight: bold;
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
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

.form-filtro {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  /* o center según prefieras */
  align-items: center;
  /* espacio entre el texto y los inputs/botones */
  gap: 4px;
  /* espacio arriba del bloque */
  margin-top: 20px;
  /* espacio debajo del bloque */
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

.buscar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
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
  background: #005f8a;
}

.limpiar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #f4a261;
  color: #1a1a1a;
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
  cursor: not-allowed;
}

.limpiar-btn:not(:disabled):hover {
  background: #e76f51;
}

.registrar-btn {
  padding: 6px 12px;
  border-radius: 6px;
  background: #0077b6;
  color: white;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.registrar-btn:hover {
  background: #005f8a;
}

.update-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #f4a261;
  color: #2b2b2b;
  border: none;
  cursor: pointer;
  margin-right: 4px;
}

.update-btn:hover {
  background: #e76f51;
}

.delete-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #e63946;
  color: #0a0a0a;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.delete-btn:hover {
  background: #c5303b;
}

.productos-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.productos-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.productos-table th {
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.25);
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
  background: #c92a2a;
  color: white;
}

.btn-yes:hover {
  background: #a12222;
}

.btn-no {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #06d6a0;
  color: #1c1c1c;
}

.btn-no:hover {
  background: #049670;
}
</style>
