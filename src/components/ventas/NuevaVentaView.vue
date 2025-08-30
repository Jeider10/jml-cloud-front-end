<!-- src/components/ventas/NuevaVentaView.vue -->

<template>
  <div class="nueva-venta-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['venta-container', { expanded: menuOpen }]">
      <!-- Encabezado -->
      <h1 class="titulo">Nueva Venta</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Formulario principal -->
      <div class="form-container">
        <div class="form-row">
          <label>Código</label>
          <input v-model="venta.codigo" type="text" />

          <label>Descripción</label>
          <input v-model="venta.descripcion" type="text" />

          <label>Cant</label>
          <input v-model.number="venta.cantidad" type="number" min="1" />

          <label>Precio</label>
          <input v-model.number="venta.precio" type="number" min="0" step="0.01" />

          <label>Seleccionar:</label>
          <input v-model="venta.fecha" type="date" />

          <!-- Botón para agregar producto desde el formulario -->
          <button type="button" class="agregar-btn" @click="agregarItem">
            ➕ Agregar
          </button>
        </div>

        <div class="form-row">
          <label class="stock">Stock Disponible</label>
          <input v-model="venta.stock" type="number" disabled />
        </div>
      </div>

      <!-- Tabla de productos -->
      <table class="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>CÓDIGO</th>
            <th>DESCRIPCIÓN</th>
            <th>CANTIDAD</th>
            <th>PRECIO U.</th>
            <th>PRECIO TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ item.codigo }}</td>
            <td>{{ item.descripcion }}</td>
            <td>{{ item.cantidad }}</td>
            <td>{{ formatNumber(item.precio) }}</td>
            <td class="precio-total-cell">
              <div class="total-value">{{ formatNumber(item.cantidad * item.precio) }}</div>

              <!-- Cuadrito para ingresar cantidad a eliminar y botón al lado -->
              <div class="mini-controls">
                <input
                  v-model.number="item.removeQty"
                  type="number"
                  min="0"
                  class="mini-input"
                  placeholder="Cant"
                />
                <button class="delete-btn" @click="eliminarItem(idx)" title="Eliminar / Restar">
                  🗑️
                </button>
              </div>
            </td>
          </tr>

          <!-- Mensaje cuando no hay items -->
          <tr v-if="items.length === 0">
            <td colspan="6" class="empty-row">No hay productos agregados.</td>
          </tr>
        </tbody>
      </table>

      <!-- === Sección final (datos cliente + acciones) === -->
      <div class="footer-venta">
        <!-- Datos de cliente -->
        <div class="form-row cliente-datos">
          <label>DNI/RUC</label>
          <input v-model="cliente.dni" type="text" />

          <label>Nombre</label>
          <input v-model="cliente.nombre" type="text" />
        </div>

        <!-- Acciones -->
        <div class="acciones-footer">
          <button @click="imprimirFactura">🖨️ Imprimir</button>
          <span class="total">💰 Total a Pagar: {{ formatNumber(calcularTotal) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'NuevaVentaView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      venta: {
        codigo: '',
        descripcion: '',
        cantidad: 1,
        precio: 0,
        stock: 0,
        fecha: new Date().toISOString().substr(0, 10)
      },
      // items: cada item tendrá { codigo, descripcion, cantidad, precio, removeQty }
      items: [],
      cliente: {
        dni: '',
        nombre: ''
      },
      // 🔔 mensajes en pantalla
      mensaje: '',
      mensajeTipo: '' // success | warning | error
    }
  },
  computed: {
    calcularTotal() {
      return this.items.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0)
    }
  },
  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
      }, 3000)
    },

    // Agrega el producto que está en el form a la tabla
    agregarItem() {
      // Validaciones mínimas
      if (!this.venta.descripcion) {
        this.mostrarMensaje('Ingrese la descripción del producto.', 'error')
        return
      }
      if (!this.venta.cantidad || this.venta.cantidad <= 0) {
        this.mostrarMensaje('Ingrese una cantidad válida.', 'error')
        return
      }
      if (this.venta.precio === '' || this.venta.precio < 0) {
        this.mostrarMensaje('Ingrese un precio válido.', 'error')
        return
      }

      // ✅ Verificar si ya existe un producto con ese código
      const existingIndex = this.items.findIndex(i => i.codigo === this.venta.codigo)
      if (existingIndex !== -1) {
        // Si existe → sumar cantidad al mismo producto
        this.items[existingIndex].cantidad += Number(this.venta.cantidad)
        this.mostrarMensaje(`⚠️ El producto con código ${this.venta.codigo} ya existe. Se actualizó la cantidad en el registro existente.`, 'warning')
      } else {
        // Si no existe → crear uno nuevo
        const newItem = {
          codigo: this.venta.codigo || '',
          descripcion: this.venta.descripcion,
          cantidad: Number(this.venta.cantidad),
          precio: Number(this.venta.precio),
          removeQty: null
        }
        this.items.push(newItem)
        this.mostrarMensaje(`✅ Producto ${this.venta.descripcion} agregado correctamente.`, 'success')
      }

      // limpiar algunos campos para el próximo registro
      this.venta.codigo = ''
      this.venta.descripcion = ''
      this.venta.cantidad = 1
      this.venta.precio = 0
    },

    // Eliminar/restar cantidad
    eliminarItem(idx) {
      if (idx >= 0 && idx < this.items.length) {
        const item = this.items[idx]
        const qtyToRemove = Number(item.removeQty)

        if (!qtyToRemove || qtyToRemove <= 0 || qtyToRemove >= item.cantidad) {
          // si no se pone nada, es 0, o es mayor/igual a la cantidad actual → se elimina el producto completo
          this.items.splice(idx, 1)
          this.mostrarMensaje(`🗑️ Producto ${item.codigo} eliminado completamente.`, 'error')
        } else {
          // caso contrario, se resta la cantidad
          item.cantidad -= qtyToRemove
          this.mostrarMensaje(`➖ Se restaron ${qtyToRemove} unidades del producto con código ${item.codigo}.`, 'warning')
          item.removeQty = null
        }
      }
    },

    imprimirFactura() {
      this.mostrarMensaje('🖨️ Aquí iría la lógica para imprimir la factura.', 'success')
    },

    // Formato numérico simple (2 decimales)
    formatNumber(value) {
      const n = Number(value) || 0
      return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }
}
</script>

<style scoped>
.nueva-venta-wrapper {
  display: flex;
}

/* Contenido principal al estilo Dashboard */
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

/* Si menú expandido, deja más espacio */
.venta-container.expanded {
  left: 220px; /* menú desplegable */
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

/* 🔔 Estilo para mensajes */
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.form-container { margin-bottom: 20px; }
.form-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

label { font-weight: bold; }

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* botón agregar (en la fila del formulario) */
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

/* Tabla de productos */
.productos-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.productos-table th,
.productos-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

/* Celda con precio total + mini controles */
.precio-total-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.total-value { font-weight: 700; color: #0b3954; }

.mini-controls { display: flex; gap: 6px; align-items: center; }
.mini-input {
  width: 70px;
  padding: 4px 6px;
  font-size: 0.9rem;
  border-radius: 4px;
  border: 1px solid #bbb;
  text-align: center;
}

/* boton eliminar pequeño */
.delete-btn {
  padding: 6px 8px;
  border-radius: 6px;
  background: #e63946;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
}
.delete-btn:hover { background: #b52a33; }

.empty-row { text-align: center; padding: 18px; color: #666; }

/* Footer final */
.footer-venta {
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid #ccc;
}

.cliente-datos { margin-bottom: 15px; }

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
button:hover { background: #004466; }

.total { font-size: 1.2rem; font-weight: bold; }
</style>
