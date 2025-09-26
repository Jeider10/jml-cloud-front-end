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

      <!-- Formulario principal (oculto en impresión) -->
      <div class="form-container no-print">
        <div class="form-row">
          <label>Código</label>
          <input v-model="venta.codigo"
                 type="text"
                 @keyup.enter="buscarProducto"
                 :disabled="!clienteEncontrado || ordenEstado !== 'ABIERTA'" />

          <label>Producto</label>
          <input v-model="venta.producto" type="text" :disabled="!clienteEncontrado || ordenEstado !== 'ABIERTA'" />

          <label>Descripción</label>
          <input v-model="venta.descripcion" type="text" :disabled="!clienteEncontrado || ordenEstado !== 'ABIERTA'" />

          <label>Cantidad</label>
          <input v-model.number="venta.cantidad" type="number" min="1" :disabled="!clienteEncontrado || ordenEstado !== 'ABIERTA'" />

          <label>Precio</label>
          <input v-model.number="venta.precio" type="number" min="1" step="0.01" :disabled="!clienteEncontrado || ordenEstado !== 'ABIERTA'" />

          <!-- ➕ Botón para agregar producto -->
          <button type="button"
                  class="agregar-btn"
                  @click="agregarItem"
                  :disabled="!formValido || !clienteEncontrado || ordenEstado !== 'ABIERTA'">
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
                  :disabled="!clienteEncontrado">
                  ➕ Nueva Venta
          </button>
        </div>
      </div>

      <!-- Tabla de productos -->
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
          <tr v-for="(item, idx) in items" :key="idx">
            <td>{{ item.codigo }}</td>
            <td>{{ item.producto }}</td>
            <td>{{ item.descripcion }}</td>
            <td>{{ item.cantidad }}</td>
            <td>{{ item.precio }}</td>
            <td>{{ item.fechaCreacion }}</td>
            <td class="no-print">{{ item.fechaActualizacion }}</td>
            <td class="precio-total-cell">
              <div class="total-value">{{ item.cantidad * item.precio }}</div>

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
          </tr>

          <!-- Mensaje cuando no hay items -->
          <tr v-if="items.length === 0">
            <td colspan="9" class="empty-row">No hay productos agregados.</td>
          </tr>
        </tbody>
      </table>

      <!-- === Sección final (datos cliente + acciones) === -->
      <div class="footer-venta">
        <!-- Datos de cliente -->
        <div class="form-row cliente-datos no-print">
          <label>Identificación Cliente</label>
          <input v-model="cliente.identificacion"
                 type="text"
                 @keyup.enter="buscarClientePorIdentificacionHandler" />

          <label>Nombre Cliente</label>
          <input v-model="cliente.nombres"
                 type="text"
                 @keyup.enter="buscarClientePorNombreHandler" />

          <label>Identificación Empleado</label>
          <input v-model="empleado.identificacion" type="text" />

          <label>Nombre Empleado</label>
          <input v-model="empleado.nombre" type="text" />
        </div>

        <!-- Acciones normales -->
        <div class="acciones-footer no-print">
          <!-- ✅ Ahora el botón también valida identificación y nombre -->
          <!-- 🖨️ Botón de imprimir -->
          <button @click="imprimirFactura"
                  :disabled="!puedeImprimir">
                  🖨️ Imprimir
          </button>

          <!-- 🧹 Botón de limpiar -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatosCliente()"
                  @click="limpiarCamposCliente">
                  🧹 Limpiar
          </button>

          <!-- ✅ Botón de cerrar venta -->
          <button type="button"
                  class="cerrar-venta-btn"
                  @click="cerrarVenta"
                  :disabled="ordenEstado !== 'ABIERTA' || items.length === 0">
                  ✅ Cerrar Venta
          </button>

          <span class="total">💰 Total a Pagar: {{ formatNumber(calcularTotal) }}</span>
        </div>

        <!-- ✅ Datos cliente y total SOLO impresión en una sola línea -->
        <div class="print-only datos-linea">
          <span><strong>Identificación Cliente:</strong> {{ cliente.identificacion }}</span>
          <span><strong>Nombre Cliente:</strong> {{ cliente.nombres }}</span>
          <span><strong>Identificación Empleado:</strong> {{ empleado.identificacion }}</span>
          <span><strong>Nombre Empleado:</strong> {{ empleado.nombre }}</span>
          <span class="total">💰 Total a Pagar: {{ formatNumber(calcularTotal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { buscarProductoPorCodigo, restarStockProducto } from '@/services/apiProductsService.js'
import { agregarProducto, restarCantidadProducto, cerrarOrdenPorCliente } from '@/services/apiOrdersService.js'
import { buscarClientePorIdentificacion, buscarClientePorNombres } from '@/services/apiCustomerService.js'

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
      items: [],
      cliente: {
        identificacion: '',
        nombres: ''
      },
      empleado: {
        identificacion: '',
        nombre: ''
      },
      clienteEncontrado: false, // ✅ habilita los campos producto solo si cliente válido
      ordenId: null, // 🔹 numeroOrden (UUID) de la orden actual
      ordenEstado: 'ABIERTA', // 🔹 Estado de la orden (ABIERTA o CERRADA)
      // 🔔 mensajes en pantalla
      mensaje: '',
      mensajeTipo: '' // success | warning | error
    }
  },

  computed: {
    calcularTotal() {
      return this.items.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0)
    },
    // ✅ Validación para habilitar botón "Agregar"
    formValido() {
      return (
        this.venta.codigo?.toString().trim() !== '' &&
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
        this.empleado.identificacion.trim() !== '' &&
        this.empleado.nombre.trim() !== ''
      )
    }
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

    // 🔹 Buscar cliente por identificación
    async buscarClientePorIdentificacionHandler() {
      if (!this.cliente.identificacion || this.cliente.identificacion.trim() === '') {
        this.mostrarMensaje('Ingrese una identificación.', 'error')
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

    // 🔹 Método de cargar productos
    async buscarProducto() {
      if (!this.venta.codigo || this.venta.codigo.toString().trim() === '') {
        this.mostrarMensaje('Ingrese un código de producto.', 'error')
        return
      }

      try {
        const response = await buscarProductoPorCodigo(Number(this.venta.codigo))
        const producto = response.data

        if (!producto) {
          this.mostrarMensaje('Producto no encontrado.', 'error')
          return
        }

        // Rellenar campos con lo que venga del backend
        this.venta.producto = producto.nombre || ''
        this.venta.descripcion = producto.descripcion || ''
        // inicializar cantidad propuesta en 1 para agregar
        this.venta.cantidad = 1
        this.venta.precio = Number(producto.precio) || 0
        // stock del producto en BD
        this.venta.stock = Number(producto.cantidad) || 0

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
        nombreEmpleado: this.empleado.nombre,
        identificacionProveedor: null,
        nombreProveedor: null,
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
             this.empleado.nombre
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

    // 🔹 Método para limpiar campos del formulario
    limpiarCamposCliente() {
      this.cliente = {
        identificacion: '',
        nombres: ''
      };
      this.empleado = {
        identificacion: '',
        nombre: ''
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
      this.ordenId = null
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
        this.ordenEstado = 'CERRADA'
        // opcional: limpiar ordenId si ya cerraste
        this.ordenId = null
        this.mostrarMensaje('✅ Venta cerrada correctamente.', 'success')
      } catch (error) {
        console.error('❌ Error al cerrar venta:', error)
        this.mostrarMensaje(error.message || 'Error al cerrar la venta en el servidor.', 'error')
      }
    },

    // ✅ Logica para imprimir
    imprimirFactura() {
      window.print()
    },

    // Formato numérico simple (2 decimales)
    formatNumber(value) {
      const n = Number(value) || 0
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.total-value {
  font-weight: 700;
  color: #0b3954;
}

.mini-controls {
  display: flex;
  gap: 6px;
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
</style>
