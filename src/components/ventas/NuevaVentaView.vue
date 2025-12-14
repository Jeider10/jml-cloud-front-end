<!-- src/components/ventas/NuevaVentaView.vue -->

<template>
  <div class="nueva-venta-wrapper">
    <!-- Menú lateral (oculto en impresión) -->
    <DashboardSideMenu class="no-print" @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['venta-container', { expanded: menuOpen }]">
      <!-- Encabezado -->
      <h1 class="titulo">Nueva Venta</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo, 'no-print']">
          {{ mensaje }}
        </div>
      </transition>

      <!-- 🗑️ Modal confirmación eliminar orden -->
      <transition name="fade">
        <div v-if="modalEliminarOrden.visible" class="modal-overlay">
          <div class="modal-content">
            <p>
              ⚠️ ¿Está seguro de eliminar la orden del cliente
              <strong>{{ modalEliminarOrden.cliente.nombres }}</strong>?
              <br />
              <small>Los productos serán devueltos al inventario.</small>
            </p>

            <div class="modal-buttons">
              <!-- ✅ Sí -->
              <button class="btn-yes"
                      @click="confirmarEliminarOrden">
                Sí
              </button>

              <!-- ❌ No -->
              <button class="btn-no"
                      @click="modalEliminarOrden.visible = false">
                No
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Formulario principal (oculto en impresión) -->
      <div class="form-container no-print">
        <div class="form-row">
          <label>Código</label>
          <input v-model="venta.codigo" type="text" @keyup.enter="buscarProducto" :disabled="!clienteEncontrado || ordenEstado === 'CERRADA'" />

          <label>Producto</label>
          <input v-model="venta.producto" type="text" @keyup.enter="buscarProducto" :disabled="!clienteEncontrado || ordenEstado === 'CERRADA'" />

          <label>Descripción</label>
          <input v-model="venta.descripcion" type="text" @keyup.enter="buscarProducto" :disabled="!clienteEncontrado || ordenEstado === 'CERRADA'" />

          <label>Cantidad</label>
          <input v-model.number="venta.cantidad" type="number" min="1" @keyup.enter="buscarProducto" :disabled="!clienteEncontrado || ordenEstado === 'CERRADA'" />

          <label>Precio</label>
          <input v-model.number="venta.precio" type="number" min="1" step="0.01" @keyup.enter="buscarProducto" :disabled="!clienteEncontrado || ordenEstado === 'CERRADA'" />

          <!-- ➕ Botón para agregar producto -->
          <button type="button"
                  class="agregar-btn"
                  @click="agregarItem"
                  :disabled="!formValido || ordenCerrada">
                  ➕ Agregar Producto
          </button>

          <!-- 🧹 Botón de limpiar campos -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
                  🧹 Limpiar campos
          </button>
        </div>

        <div class="form-row">
          <label class="stock">Existencias disponibles</label>
          <input v-model="venta.stock" type="number" disabled />

          <!-- ➕ Botón de nueva venta -->
          <button type="button"
                  class="agregar-btn"
                  @click="agregarCliente"
                  :disabled="!tieneDatos">
                  ➕ Nueva Venta
          </button>
        </div>

        <!-- 🔹 Filtro de órdenes por estado con botón al lado -->
        <div class="form-row" style="display: flex; align-items: center; gap: 8px;">
          <label for="filtroEstado">Filtrar Órdenes</label>

          <!-- Select de estados -->
          <select
            v-model="filtroEstado"
            id="filtroEstado">
            <option disabled value="">Seleccione un estado</option>
            <option value="ABIERTA">ABIERTA</option>
            <option value="CERRADA">CERRADA</option>
          </select>

          <!-- 🔍 Botón de búsqueda, deshabilitado si no hay estado seleccionado -->
          <button type="button"
                  class="buscar-btn"
                  @click="cargarOrdenesFiltradas"
                  :disabled="!filtroEstado">
                  🔍 Buscar
          </button>

          <!-- 🧹 Botón de limpiar filtro -->
          <button type="button"
                    class="limpiar-campos-btn"
                    @click="limpiarFiltro"
                    :disabled="!filtroEstado">
                    🧹 Limpiar filtro
          </button>
        </div>

        <!-- select de órdenes abiertas -->
        <div v-if="ordenesFiltradas.length > 0" class="form-row">
          <label for="ordenSeleccionada">Seleccione Orden</label>
          <select v-model="ordenSeleccionada" id="ordenSeleccionada" @change="cargarItemsOrdenSeleccionada">
            <option disabled value="">Seleccione una orden</option>
            <option v-for="orden in ordenesFiltradas" :key="orden.numeroOrden" :value="orden.numeroOrden">
              Orden {{ orden.numeroOrden }} - Estado: {{ orden.estadoOrden }} - Total: {{ formatPrecioCOP(totalOrden(orden)) }}
            </option>
          </select>

          <!-- Check de órdenes por cliente o general -->
          <div class="filtro-opciones">
            <label>
              <input type="checkbox" v-model="filtrarPorCliente" />
              Ver solo órdenes del cliente actual
            </label>
          </div>
        </div>
      </div>

      <!-- tabla de productos solo de la orden seleccionada -->
      <table class="productos-table">
        <thead>
          <tr>
            <th>CÓDIGO</th>
            <th>PRODUCTO</th>
            <th>DESCRIPCIÓN</th>
            <th>CANTIDAD</th>
            <th>PRECIO U.</th>
            <th>FECHA CREACIÓN</th>
            <th class="no-print">FECHA ACTUALIZACIÓN</th>
            <th>PRECIO TOTAL</th>
          </tr>
        </thead>

        <tbody>
          <!-- 🔹 Productos agregados -->
          <tr v-for="(item, idx) in items" :key="'item-' + idx">
            <td>{{ item.codigo }}</td>
            <td>{{ item.producto }}</td>
            <td>{{ item.descripcion }}</td>

            <td class="cantidad-cell">
              <span>{{ item.cantidad }}</span>
              <!-- Cuadrito para ingresar cantidad a eliminar y botón al lado -->
              <div class="mini-controls no-print" v-if="ordenEstado === 'ABIERTA'">
                <input v-model.number="item.removeQty"
                       type="number"
                       min="0"
                       class="mini-input"
                       placeholder="Cant" />
                <!-- ❌️ Botón de no -->
                <button class="delete-btn"
                        @click="eliminarItem(idx)"
                        title="Eliminar / Restar">
                        🗑️
                </button>
              </div>
            </td>

            <td>{{ formatPrecioCOP(item.precio) }}</td>
            <td>{{ item.fechaCreacion }}</td>
            <td class="no-print">{{ item.fechaActualizacion }}</td>
            <td class="precio-total-cell">
              {{ formatPrecioCOP(item.cantidad * item.precio) }}
            </td>
          </tr>

          <tr v-if="items.length === 0">
            <td colspan="8" class="empty-row">No hay productos agregados ni órdenes filtradas.</td>
          </tr>
        </tbody>
      </table>

      <!-- === Sección final (datos cliente + acciones) === -->
      <div class="footer-venta">
        <!-- Datos de cliente -->
        <div class="form-row cliente-datos no-print">
          <label>Identificación Cliente</label>
          <input v-model="cliente.identificacion" type="text" :disabled="ordenEstado === 'CERRADA'" @keyup.enter="buscarClientePorIdentificacionHandler" />

          <label>Nombre Cliente</label>
          <input v-model="cliente.nombres" type="text" :disabled="ordenEstado === 'CERRADA'" @keyup.enter="buscarClientePorNombreHandler" />

          <label>Identificación Empleado</label>
          <input v-model="empleado.identificacion" type="text" :disabled="!clienteEncontrado || ordenCerrada" @keyup.enter="buscarEmpleadoPorIdentificacionHandler" />

          <label>Nombre Empleado</label>
          <input v-model="empleado.nombres" type="text" :disabled="!clienteEncontrado || ordenCerrada" @keyup.enter="buscarEmpleadoPorNombreHandler"  />
        </div>

        <!-- Acciones normales -->
        <div class="acciones-footer no-print">
          <!-- ✅ Ahora el botón también valida identificación y nombre -->
          <!-- 🖨️ Botón de imprimir -->
          <button @click="imprimirFactura"
                  :disabled="!puedeImprimir">
                  🖨️ Imprimir
          </button>

          <button type="button"
                  class="eliminar-orden-btn"
                  :disabled="!ordenId || ordenEstado === 'CERRADA'"
                  @click="abrirModalEliminarOrden">
                  ❌🗑️ Eliminar Orden
          </button>

          <!-- 🧹 Botón de limpiar -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatosCliente() || ordenCerrada"
                  @click="limpiarCamposCliente">
                  🧹 Limpiar
          </button>

          <!-- ✅ Botón de cerrar venta -->
          <button type="button"
                  class="cerrar-venta-btn"
                  @click="cerrarVenta"
                  :disabled="ordenCerrada || items.length === 0">
                  ✅ Cerrar Venta
          </button>

          <span class="total">💰 Total a Pagar: {{ formatPrecioCOP(calcularTotal) }}</span>
        </div>

        <!-- ✅ Datos cliente y total SOLO impresión en una sola línea -->
        <div class="print-only datos-linea">
          <span><strong>Identificación Cliente:</strong> {{ cliente.identificacion }}</span>
          <span><strong>Nombre Cliente:</strong> {{ cliente.nombres }}</span>
          <span><strong>Identificación Empleado:</strong> {{ empleado.identificacion }}</span>
          <span><strong>Nombre Empleado:</strong> {{ empleado.nombres }}</span>
          <span class="total">💰 Total a Pagar: {{ formatPrecioCOP(calcularTotal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>



<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import {
  buscarProductoPorCodigo,
  buscarProductoPorNombre,
  buscarProductoPorDescripcion,
  buscarProductoPorCantidad,
  buscarProductoPorPrecio,
  restarStockProducto
} from '@/services/apiProductsService.js'
import {
  agregarProducto,
  restarCantidadProducto,
  cerrarOrdenPorCliente,
  listarOrdenesPorEstado,
  listarOrdenesPorClienteYEstado,
  eliminarOrdenCliente
} from '@/services/apiOrdersService.js'
import { buscarClientePorIdentificacion, buscarClientePorNombres } from '@/services/apiCustomerService.js'
import { buscarEmpleadoPorIdentificacion, buscarEmpleadoPorNombres } from '@/services/apiEmployeesService.js'

export default {
  name: 'NuevaVentaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      venta: {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: null,
        precio: null,
        stock: 0
      },
      cliente: {
        identificacion: '',
        nombres: ''
      },
      empleado: {
        identificacion: '',
        nombres: ''
      },
      producto: {
        proveedorId: null,
        proveedorName: ''
      },
      items: [],
      ordenId: null, // 🔹 numeroOrden (UUID) de la orden actual
      ordenEstado: 'ABIERTA', // 🔹 Estado de la orden (ABIERTA o CERRADA)
      // 🔔 mensajes en pantalla
      mensaje: '',
      mensajeTipo: '', // success | warning | error
      filtroEstado: '',
      filtrarPorCliente: false,
      ordenesFiltradas: [],
      ordenSeleccionada: null, // Número de orden activa seleccionada
      ordenCargada: false, // Indica si se seleccionó una orden para mostrar detalles
      clienteEncontrado: false, // ✅ habilita los campos producto solo si cliente válido
      empleadoEncontrado: false,  // ✅ agregado para consistencia
      empleadosFiltrados: [],
      modalEliminarOrden: {
        visible: false,
        ordenId: null,
        cliente: {
          identificacion: null,
          nombres: ''
        }
      }
    }
  },

  computed: {
    tieneDatos() {
      return (
        (this.cliente.identificacion && this.cliente.identificacion !== null) ||
        (this.cliente.nombres && this.cliente.nombres.trim() !== "") ||
        (this.filtroBusqueda && this.filtroBusqueda.trim() !== "") ||
        (this.empleado.identificacion && this.empleado.identificacion.trim() !== "") ||
        (this.empleado.nombres && this.empleado.nombres.trim() !== "") ||
        (this.producto.codigo && this.producto.codigo.trim() !== "") ||
        (this.producto.nombre && this.producto.nombre.trim() !== "")
      )
    },

    ordenCerrada() {
      return this.ordenEstado === 'CERRADA'
    },

    calcularTotal() {
      return this.items.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0)
    },
    // ✅ Validación para habilitar botón "Agregar"
    formValido() {
      return (
        // this.venta.codigo?.trim() !== '' &&
        this.venta.codigo >= 1 &&
        this.venta.producto?.trim() !== '' &&
        this.venta.descripcion?.trim() !== '' &&
        this.venta.cantidad >= 1 &&
        this.venta.precio >= 1
      )
    },
    // ✅ Validación para habilitar botón "Imprimir"
    puedeImprimir() {
      return (
        this.items.length > 0 &&
        this.clienteEncontrado &&
        String(this.empleado.identificacion || '').trim() !== '' &&
        String(this.empleado.nombres || '').trim() !== ''
      )
    }
  },

  mounted() {
    // 🔹 Cargar todas las ordenes abiertas desde backend al iniciar
    this.filtroEstado = 'ABIERTA'
    this.cargarOrdenesFiltradas()
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

    cargarItemsOrdenSeleccionada() {
      const orden = this.ordenesFiltradas.find(o => o.numeroOrden === this.ordenSeleccionada)
      if (orden) {
        // Cargar items de la orden
        this.items = (orden.detalles || []).map(d => ({
          codigo: d.codigo,
          producto: d.producto,
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precio: d.precio,
          fechaCreacion: d.fechaCreacion,
          fechaActualizacion: d.fechaActualizacion,
          removeQty: null
        }))

        // Llenar datos del cliente
        this.cliente.identificacion = orden.identificacionCliente || ''
        this.cliente.nombres = orden.nombreCliente || ''
        this.clienteEncontrado = true

        // Guardar ordenId para operaciones futuras
        this.ordenId = orden.numeroOrden
        this.ordenEstado = orden.estadoOrden || 'ABIERTA'
        // Activar campos y tabla
        this.ordenCargada = true
      } else {
        this.items = []
        this.ordenId = null
        this.clienteEncontrado = false
        this.ordenCargada = false
      }
    },

    async cargarOrdenesFiltradas() {
      try {
        // Limpieza inicial
        this.ordenesFiltradas = []
        this.ordenSeleccionada = null
        this.items = []
        this.ordenCargada = false

        let response
        if (this.filtrarPorCliente && this.cliente.identificacion) {
          // 🔹 Escenario por cliente
          response = await listarOrdenesPorClienteYEstado(this.cliente.identificacion, this.filtroEstado)
        } else {
          // 🔹 Escenario global
          response = await listarOrdenesPorEstado(this.filtroEstado)
        }

        this.ordenesFiltradas = response.data || []
        this.mostrarMensaje(`✅ ${this.ordenesFiltradas.length} órdenes cargadas.`, 'success')

        if (this.ordenesFiltradas.length === 1) {
          // 👌 Si hay solo una orden, la cargamos directo
          this.ordenSeleccionada = this.ordenesFiltradas[0].numeroOrden
          this.cargarItemsOrdenSeleccionada()
        } else {
          // 👌 Si hay más de una, obligamos al usuario a elegir
          this.ordenSeleccionada = null
          this.items = []
          this.ordenCargada = false
        }

      } catch (error) {
        console.error('❌ Error al cargar órdenes filtradas:', error)
        this.mostrarMensaje('Error al obtener órdenes filtradas.', 'error')
        this.ordenesFiltradas = []
        this.ordenCargada = false
      }
    },

    // async cargarOrdenesFiltradas() {
      // try {
        // const response = await listarOrdenesPorEstado(this.filtroEstado)

        // this.ordenesFiltradas = response.data || []
        // this.mostrarMensaje(`✅ ${this.ordenesFiltradas.length} órdenes cargadas.`, 'success')

        // if (this.ordenesFiltradas.length === 1) {
          // this.ordenSeleccionada = this.ordenesFiltradas[0].numeroOrden
          // this.cargarItemsOrdenSeleccionada()
        // } else {
          // this.ordenSeleccionada = null
          // this.items = []
          // this.ordenCargada = false
        // }

      // } catch (error) {
        // console.error('❌ Error al cargar órdenes filtradas:', error)
        // this.mostrarMensaje('Error al obtener órdenes filtradas.', 'error')
        // this.ordenesFiltradas = []
        // this.ordenCargada = false
      // }
    // },

    // 🔹 Buscar cliente por identificación
    async buscarClientePorIdentificacionHandler() {
      if (!this.cliente.identificacion || this.cliente.identificacion === null) {
        this.mostrarMensaje('Ingrese una identificación del cliente.', 'error')
        return
      }
      try {
        const response = await buscarClientePorIdentificacion(Number(this.cliente.identificacion))
        const cliente = response.data
        if (cliente) {
          this.cliente.nombres = cliente.nombres || ''
          this.clienteEncontrado = true
          this.ordenEstado = 'ABIERTA'   // 👈 Reiniciamos estado al abrir nueva orden
          this.mostrarMensaje(`✅ Cliente encontrado: ${cliente.nombres}`, 'success')
        } else {
          this.clienteEncontrado = false
          this.mostrarMensaje('❌ Cliente no encontrado.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al buscar cliente por identificación:', error)
        this.mostrarMensaje('Error en búsqueda de cliente por identificación.', 'error')
        this.clienteEncontrado = false
      }
    },

    // 🔹 Buscar cliente por nombre
    async buscarClientePorNombreHandler() {
      if (!this.cliente.nombres || this.cliente.nombres.trim() === '') {
        this.mostrarMensaje('Ingrese un nombre de cliente.', 'error')
        return
      }
      try {
        const response = await buscarClientePorNombres(this.cliente.nombres)
        const clientes = response.data
        if (clientes && clientes.length > 0) {
          // Tomamos el primero por simplicidad
          const cliente = clientes[0]
          this.cliente.identificacion = cliente.identificacion || ''
          this.clienteEncontrado = true
          this.ordenEstado = 'ABIERTA'   // 👈 Reiniciamos estado al abrir nueva orden
          this.mostrarMensaje(`✅ Cliente encontrado: ${cliente.nombres}`, 'success')
        } else {
          this.clienteEncontrado = false
          this.mostrarMensaje('❌ No se encontraron clientes con ese nombre.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al buscar cliente por nombre:', error)
        this.mostrarMensaje('Error en búsqueda de cliente por nombre.', 'error')
        this.clienteEncontrado = false
      }
    },

    // 🔹 Buscar Empleado por identificación
    async buscarEmpleadoPorIdentificacionHandler() {
      const texto = this.empleado.identificacion?.trim()

      if (!texto) {
        this.mostrarMensaje('Ingrese una identificación del empleado.', 'error')
        return
      }

      try {
        // Llamada al servicio
        const response = await buscarEmpleadoPorIdentificacion(Number(texto))
        const data = response.data

        // Normalizar: puede venir objeto, null o estructura vacía
        let empleadoEncontradoObj = null
        if (data && typeof data === 'object') {
          empleadoEncontradoObj = data
        }

        // Consideramos válido solo si tiene campos útiles
        const tieneCamposUtiles = empleadoEncontradoObj &&
          (empleadoEncontradoObj.identificacion || empleadoEncontradoObj.nombres || empleadoEncontradoObj.apellidos)

        if (tieneCamposUtiles) {
          // Normalizar valores para evitar undefined
          const identificacion = empleadoEncontradoObj.identificacion ?? ''
          const nombres = empleadoEncontradoObj.nombres ?? ''
          const apellidos = empleadoEncontradoObj.apellidos ?? ''

          // Guardar como array para la UI
          this.empleadosFiltrados = [empleadoEncontradoObj]

          // Asignar al formulario
          this.empleado.identificacion = identificacion
          this.empleado.nombres = nombres
          this.empleado.apellidos = apellidos
          this.empleadoEncontrado = true

          this.mostrarMensaje(`✅ Empleado encontrado: ${nombres} ${apellidos}`.trim(), 'success')
        } else {
          // No hay empleado válido
          this.empleadosFiltrados = []
          this.empleado.nombres = ''
          this.empleado.apellidos = ''
          this.empleadoEncontrado = false
          this.mostrarMensaje('⚠️ Empleado no encontrado.', 'warning')
        }

      } catch (error) {
        console.error('❌ Error al buscar Empleado por identificación:', error)

        // Limpieza del estado
        this.empleadosFiltrados = []
        this.empleado.nombres = ''
        this.empleado.apellidos = ''
        this.empleadoEncontrado = false

        // Manejo de errores conocidos
        if (error.message?.includes('Cannot invoke') || error.message?.includes('null')) {
          this.mostrarMensaje('⚠️ Empleado no encontrado.', 'warning')
        } else if (error.message?.includes('404')) {
          this.mostrarMensaje('⚠️ Empleado no encontrado.', 'warning')
        } else {
          this.mostrarMensaje(error.message || '❌ Error en búsqueda de empleado.', 'error')
        }
      }
    },

    // 🔹 Buscar Empleado por nombres
    async buscarEmpleadoPorNombreHandler() {
      const texto = this.empleado.nombres?.trim()

      if (!texto) {
        this.mostrarMensaje('Ingrese un nombre de empleado.', 'error')
        return
      }

      try {
        const response = await buscarEmpleadoPorNombres(texto)
        const data = response.data

        // Normalizar: puede venir array, objeto o null
        let empleadoEncontradoObj = null
        if (Array.isArray(data) && data.length > 0 && data[0]) {
          empleadoEncontradoObj = data[0]
        } else if (data && typeof data === 'object') {
          empleadoEncontradoObj = data
        }

        // Consideramos "encontrado" solo si hay al menos un campo útil
        const tieneCamposUtiles = empleadoEncontradoObj &&
          (empleadoEncontradoObj.identificacion || empleadoEncontradoObj.nombres || empleadoEncontradoObj.apellidos)

        if (tieneCamposUtiles) {
          // Normalizar valores para evitar undefined
          const identificacion = empleadoEncontradoObj.identificacion ?? ''
          const nombres = empleadoEncontradoObj.nombres ?? ''
          const apellidos = empleadoEncontradoObj.apellidos ?? ''

          // Guardar como array para la UI (coherente con la otra búsqueda)
          this.empleadosFiltrados = [empleadoEncontradoObj]

          // Asignar al formulario
          this.empleado.identificacion = identificacion
          this.empleado.nombres = nombres
          this.empleado.apellidos = apellidos
          this.empleadoEncontrado = true

          this.mostrarMensaje(`✅ Empleado encontrado: ${nombres} ${apellidos}`.trim(), 'success')
        } else {
          // No hay empleado válido
          this.empleadosFiltrados = []
          this.empleado.identificacion = ''
          this.empleado.apellidos = ''
          this.empleadoEncontrado = false
          this.mostrarMensaje('⚠️ No se encontraron empleados con ese nombre.', 'warning')
        }

      } catch (error) {
        console.error('❌ Error al buscar empleado por nombre:', error)

        // Limpieza del estado
        this.empleadosFiltrados = []
        this.empleado.identificacion = ''
        this.empleado.apellidos = ''
        this.empleadoEncontrado = false

        // Si el backend lanzó un NullPointer o devolvió null tratado como excepción
        if (error.message?.includes('Cannot invoke') || error.message?.includes('null')) {
          this.mostrarMensaje('⚠️ No se encontraron empleados con ese nombre.', 'warning')
        } else if (error.message?.includes('404')) {
          this.mostrarMensaje('⚠️ No se encontraron empleados con ese nombre.', 'warning')
        } else {
          this.mostrarMensaje(error.message || '❌ Error en búsqueda de empleado por nombre.', 'error')
        }
      }
    },

    // 🔹 Método de cargar productos
    async buscarProducto() {
      try {
        let response

        if (this.venta.codigo) {
          response = await buscarProductoPorCodigo(Number(this.venta.codigo))
        } else if (this.venta.producto) {
          response = await buscarProductoPorNombre(this.venta.producto)
        } else if (this.venta.descripcion) {
          response = await buscarProductoPorDescripcion(this.venta.descripcion)
        } else if (this.venta.cantidad) {
          response = await buscarProductoPorCantidad(this.venta.cantidad)
        } else if (this.venta.precio) {
          response = await buscarProductoPorPrecio(this.venta.precio)
        } else {
          this.mostrarMensaje('Ingrese un criterio de búsqueda válido.', 'error')
          return
        }

        const data = response.data
        const producto = Array.isArray(data) ? data[0] : data

        if (!producto) {
          this.mostrarMensaje('Producto no encontrado.', 'error')
          return
        }

        // ✅ Rellenar campos con lo que venga del backend
        // this.venta.codigo = String(producto.codigo || '')
        this.venta.codigo = Number(producto.codigo)
        this.venta.producto = producto.nombre || ''
        this.venta.descripcion = producto.descripcion || ''
        // inicializar cantidad propuesta en 1 para agregar
        this.venta.cantidad = 1
        this.venta.precio = Number(producto.precio) || 0
        // stock del producto en BD
        this.venta.stock = Number(producto.cantidad) || 0

        // ✅ Guardar proveedor
        this.producto.proveedorId = producto.proveedorId || null
        this.producto.proveedorName = producto.proveedorName || ''

      } catch (error) {
        console.error('❌ Error al buscar producto:', error)
        this.mostrarMensaje('Error al buscar producto en el servidor.', 'error')
      }
    },

    // 🔹 Método agregar productos a la tabla
    async agregarItem() {
      // Validaciones mínimas
      if (!this.formValido) {
        this.mostrarMensaje('⚠️ Complete todos los campos antes de agregar.', 'error')
        return
      }

      // validar stock
      if (this.venta.cantidad > this.venta.stock) {
        this.mostrarMensaje('No hay suficiente stock disponible.', 'error')
        return
      }

      // 🚀 Construir el payload para enviar al backend
      const payload = {
        identificacionCliente: Number(this.cliente.identificacion),
        nombreCliente: this.cliente.nombres,
        identificacionEmpleado: Number(this.empleado.identificacion),
        nombreEmpleado: this.empleado.nombres,
        identificacionProveedor: this.producto.proveedorId,
        nombreProveedor: this.producto.proveedorName,
        detalles: [
          {
            codigo: Number(this.venta.codigo), // código del producto
            producto: this.venta.producto,
            descripcion: this.venta.descripcion,
            cantidad: Number(this.venta.cantidad),
            precio: Number(this.venta.precio)
          }
        ]
      }

      try {
        // 1️⃣ Registrar en órdenes (crea o agrega a orden ABIERTA del cliente)
        const response = await agregarProducto(payload)
        const ordenActualizada = response.data

        // guardar el numeroOrden (UUID) para futuras operaciones (restar)
        this.ordenId = ordenActualizada.numeroOrden

        // Construir/actualizar la tabla local con la respuesta completa (detalles)
        if (ordenActualizada.detalles && ordenActualizada.detalles.length > 0) {
          // Reemplazar items por resultados del backend (más seguro)
          this.items = ordenActualizada.detalles.map(d => ({
            codigo: d.codigo,
            producto: d.producto,
            descripcion: d.descripcion,
            cantidad: d.cantidad,
            precio: d.precio,
            fechaCreacion: d.fechaCreacion,
            fechaActualizacion: d.fechaActualizacion,
            removeQty: null
          }))
        }

        // 2️⃣ Restar stock en productos
        await restarStockProducto(this.venta.codigo, this.venta.cantidad)

        this.mostrarMensaje(`✅ Producto ${this.venta.producto} agregado correctamente.`, 'success')

        // 3️⃣ Limpiar campos
        this.venta.codigo = ''
        this.venta.producto = ''
        this.venta.descripcion = ''
        this.venta.cantidad = null
        this.venta.precio = null
        this.venta.stock = 0

        this.producto = {
          proveedorId: null,
          proveedorName: ''
        }

      } catch (error) {
        console.error('❌ Error al agregar producto:', error)
        this.mostrarMensaje(error.message || 'Error al agregar producto en el servidor.', 'error')
      }
    },

    // 🔹 Metódo de eliminar/restar cantidad
    async eliminarItem(idx) {
      if (idx >= 0 && idx < this.items.length) {
        const item = this.items[idx]
        const qtyToRemove = Number(item.removeQty)

        // si no se pone nada o qty >= cantidad actual → eliminar todo
        const cantidadARestar = !qtyToRemove || qtyToRemove <= 0 || qtyToRemove >= item.cantidad
          ? item.cantidad : qtyToRemove

        if (!this.ordenId) {
          this.mostrarMensaje('⚠️ No hay orden abierta asociada. Vuelve a agregar el producto.', 'error')
          return
        }

        try {
          // 1️⃣ Actualizar en órdenes (pass numeroOrden, codigoProducto, cantidad)
          const response = await restarCantidadProducto(this.ordenId, item.codigo, cantidadARestar)
          const ordenActualizada = response.data

          // 2️⃣ Actualizar en productos (stock global)
          await restarStockProducto(item.codigo, -cantidadARestar) // 👈 ojo, aquí sería sumar de nuevo al stock (negativo = devolver)

          // 3️⃣ Actualizar tabla local con los detalles devueltos por el backend
          if (ordenActualizada.detalles && ordenActualizada.detalles.length > 0) {
            this.items = ordenActualizada.detalles.map(d => ({
              codigo: d.codigo,
              producto: d.producto,
              descripcion: d.descripcion,
              cantidad: d.cantidad,
              precio: d.precio,
              fechaCreacion: d.fechaCreacion,
              fechaActualizacion: d.fechaActualizacion,
              removeQty: null
            }))
            this.mostrarMensaje(`➖ Se restaron ${cantidadARestar} unidades del producto ${item.codigo}.`, 'warning')
          } else {
            // si no hay detalles => la orden quedó vacía
            this.items = []
            this.mostrarMensaje(`🗑️ Producto ${item.codigo} eliminado de la orden.`, 'error')
          }
        } catch (error) {
          console.error('❌ Error al restar producto:', error)
          this.mostrarMensaje(error.message || 'Error al restar producto en el servidor.', 'error')
        }
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.venta.codigo ||
             this.venta.producto ||
             this.venta.descripcion ||
             this.venta.cantidad ||
             this.venta.precio ||
             this.venta.stock
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatosCliente() {
      return this.cliente.identificacion ||
             this.cliente.nombres ||
             this.empleado.identificacion ||
             this.empleado.nombres
    },

    // 🔹 Método para limpiar campos del formulario
    limpiarCampos() {
      this.venta = {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: null,
        precio: null,
        stock: 0
      }
    },

    limpiarFiltro() {
        this.filtroEstado = ''   // Reinicia select
        this.ordenesFiltradas = [] // Opcional: limpiar resultados de la tabla
        // Reset cliente si quieres deshabilitar botones nuevamente
        this.cliente = { identificacion: '', nombres: '' }
        this.clienteEncontrado = false
        this.empleadoEncontrado = false
        this.ordenEstado = 'ABIERTA'  // o '' si quieres deshabilitar todo
        // 👇 limpiar tabla
        this.items = [];
    },

    // limpiarFiltro() {
      // this.filtroEstado = ''       // Reinicia select de estado
      // this.ordenesFiltradas = []   // Limpia lista de órdenes
      // this.ordenSeleccionada = null
      // this.items = []
      // this.ordenCargada = false
      // this.mostrarMensaje('✅ Filtro limpiado. Seleccione un estado para buscar.', 'success')
    // },

    // 🔹 Método para limpiar campos del formulario
    limpiarCamposCliente() {
      this.cliente = {
        identificacion: '',
        nombres: ''
      };
      this.empleado = {
        identificacion: '',
        nombres: ''
      };
      this.venta = {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: null,
        precio: null,
        stock: 0
      };
      // 👇 limpiar tabla
      this.items = [];
      // 👇 Deshabilitar de nuevo los campos de producto
      this.clienteEncontrado = false
      this.empleadoEncontrado = false
      this.ordenId = null
      this.filtroEstado = ''   // Reinicia select
      this.ordenesFiltradas = [] // Opcional: limpiar resultados de la tabla
    },

    // 🔹 Método para iniciar nueva venta
    agregarCliente() {
      this.limpiarCamposCliente();
      this.ordenEstado = 'ABIERTA'   // 👈 Reiniciamos estado al abrir nueva orden
      this.mostrarMensaje('✅ Listo para registrar una nueva venta.', 'success');
    },

    // ✅ Nuevo método para cerrar la venta
    async cerrarVenta() {
      if (!this.cliente.identificacion) {
        this.mostrarMensaje('⚠️ No hay cliente seleccionado para cerrar orden.', 'warning')
        return
      }
      try {
        await cerrarOrdenPorCliente(this.cliente.identificacion)

        // Marcar la orden como cerrada
        this.ordenEstado = 'CERRADA'
        // opcional: limpiar ordenId si ya cerraste
        this.ordenId = null

        this.mostrarMensaje('✅ Venta cerrada correctamente.', 'success')

        // 🔹 Limpiar todo para nueva venta
        this.resetVenta()

      } catch (error) {
        console.error('❌ Error al cerrar venta:', error)
        this.mostrarMensaje(error.message || 'Error al cerrar la venta en el servidor.', 'error')
      }
    },

    // 🔹 Método auxiliar para reiniciar todo
    resetVenta() {
      this.cliente = {
        identificacion: '',
        nombres: ''
      }
      this.empleado = {
        identificacion: '',
        nombres: ''
      }
      this.venta = {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        stock: 0
      }
      this.items = []
      this.ordenSeleccionada = null
      this.ordenCargada = false
      this.ordenesFiltradas = []
      this.filtroEstado = 'ABIERTA'
      this.filtrarPorCliente = false
      this.clienteEncontrado = false
      this.empleadoEncontrado = false
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

    // 🔹 Método para el cálculo del total de la órden
    totalOrden(orden) {
      return (orden.detalles || []).reduce((sum, d) => sum + d.cantidad * d.precio, 0)
    },

    async confirmarEliminarOrden() {
      try {
        // cerrar modal
        this.modalEliminarOrden.visible = false

        // 1️⃣ DEVOLVER STOCK
        for (const item of this.items) {
          await restarStockProducto(item.codigo, -item.cantidad)
        }

        // 2️⃣ ELIMINAR ORDEN
        await eliminarOrdenCliente(
          this.modalEliminarOrden.ordenId,
          this.modalEliminarOrden.cliente.identificacion
        )

        // 3️⃣ LIMPIAR UI
        this.items = []
        this.ordenId = null
        this.ordenEstado = 'ABIERTA'
        this.ordenSeleccionada = null
        this.ordenCargada = false

        this.mostrarMensaje('🗑️ Orden eliminada correctamente.', 'success')

        await this.cargarOrdenesFiltradas()

      } catch (error) {
        console.error('❌ Error al eliminar orden:', error)
        this.mostrarMensaje(
          error.message || 'Error al eliminar la orden.',
          'error'
        )
      }
    },

    abrirModalEliminarOrden() {
      if (!this.ordenId || !this.cliente.identificacion) {
        this.mostrarMensaje('⚠️ No hay una orden válida para eliminar.', 'warning')
        return
      }

      this.modalEliminarOrden = {
        visible: true,
        ordenId: this.ordenId,
        cliente: {
          identificacion: this.cliente.identificacion,
          nombres: this.cliente.nombres
        }
      }
    },

    // ✅ Logica para imprimir
    imprimirFactura() {
      window.print()
    }
  }
}
</script>



<style scoped>
.nueva-venta-wrapper {
  display: flex;
}

.venta-container {
  position: absolute;
  top: 0;
  left: 60px; /* ancho colapsado del menú */
  right: 0;
  bottom: 0;
  padding: 20px;
  background-color: #6fffd4;
  overflow-y: auto; /* solo aparece si se necesita */
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.venta-container.expanded {
  left: 220px; /* menú desplegable */
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: -10px;    /* espacio desde arriba */
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

.buscar-btn:hover {
  background: #049670;
}

.buscar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.agregar-btn:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
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

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.precio-total-cell {
  background-color: white;
  text-align: center;
  font-weight: 700;
  color: #0b3954;
  padding: 4px 0;
}

.cantidad-cell {
  display: flex;
  flex-direction: column; /* apila verticalmente */
  align-items: center; /* alinea todo al inicio de la celda */
  gap: 4px; /* espacio entre cantidad y controles */
}

.mini-controls {
  display: flex;
  gap: 4px; /* espacio entre input y botón */
  align-items: center;
}

.mini-input {
  width: 70px;
  padding: 4px 6px;
  font-size: 0.9rem;
  border-radius: 4px;
  border: 1px solid #bbb;
  text-align: center;
}

.delete-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #e63946;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.delete-btn:hover {
  background: #b52a33;
}

.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

.footer-venta {
  margin-top: auto;
  padding-top: 20px;
}

.cliente-datos {
  margin-bottom: 15px;
}

.acciones-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #005b82;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

button:hover {
  background: #004466;
}

button:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
}

.total {
  font-size: 1.2rem;
  font-weight: bold;
}

/* 🔹 Estilos para impresión */
@media print {
  .no-print {
    display: none !important;
  }

  .print-only {
    display: inline-block !important;
  }

  .venta-container {
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    padding: 0 !important;
    background: white !important;
  }

  .footer-venta {
    margin-top: auto !important;
    page-break-inside: avoid;
  }

  /* ✅ Una sola línea fija al pie de la hoja */
  .print-only.datos-linea {
    display: flex !important;
    justify-content: space-between;
    font-size: 1.1rem;
    font-weight: bold;
    border-top: 2px solid #000;
    padding-top: 10px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
}

.print-only {
  display: none;
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
