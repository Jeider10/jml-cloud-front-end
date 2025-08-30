<!-- src/components/ventas/NuevaVentaView.vue -->

<template>
  <div class="nueva-venta-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['venta-container', { expanded: menuOpen }]">
      <!-- Encabezado -->
      <h1 class="titulo">Nueva Venta</h1>

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
            <th>DESCRIPCIÓN</th>
            <th>CANTIDAD</th>
            <th>PRECIO U.</th>
            <th>PRECIO TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in items" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ item.descripcion }}</td>
            <td>{{ item.cantidad }}</td>
            <td>{{ formatNumber(item.precio) }}</td>
            <td class="precio-total-cell">
              <div class="total-value">{{ formatNumber(item.cantidad * item.precio) }}</div>

              <!-- cuadrito para ingresar un id y boton eliminar al lado -->
              <div class="mini-controls">
                <input
                  v-model="item.customId"
                  type="text"
                  class="mini-input"
                  placeholder="ID"
                />
                <button class="delete-btn" @click="eliminarItem(idx)" title="Eliminar">
                  🗑️
                </button>
              </div>
            </td>
          </tr>

          <!-- Mensaje cuando no hay items -->
          <tr v-if="items.length === 0">
            <td colspan="5" class="empty-row">No hay productos agregados.</td>
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
      // items: cada item tendrá { codigo, descripcion, cantidad, precio, customId }
      items: [],
      cliente: {
        dni: '',
        nombre: ''
      }
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

    // Agrega el producto que está en el form a la tabla
    agregarItem() {
      // Validaciones mínimas
      if (!this.venta.descripcion) {
        alert('Ingrese la descripción del producto.')
        return
      }
      if (!this.venta.cantidad || this.venta.cantidad <= 0) {
        alert('Ingrese una cantidad válida.')
        return
      }
      if (this.venta.precio === '' || this.venta.precio < 0) {
        alert('Ingrese un precio válido.')
        return
      }

      // Construir item y agregar
      const newItem = {
        codigo: this.venta.codigo || '',
        descripcion: this.venta.descripcion,
        cantidad: Number(this.venta.cantidad),
        precio: Number(this.venta.precio),
        customId: '' // cuadrito editable por el usuario
      }

      this.items.push(newItem)

      // limpiar algunos campos para el próximo registro (manteniendo fecha y stock si quieres)
      this.venta.codigo = ''
      this.venta.descripcion = ''
      this.venta.cantidad = 1
      this.venta.precio = 0
    },

    // Eliminar item por índice
    eliminarItem(idx) {
      if (idx >= 0 && idx < this.items.length) {
        this.items.splice(idx, 1)
      }
    },

    imprimirFactura() {
      alert('🖨️ Aquí iría la lógica para imprimir la factura.')
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
.agregar-btn:hover {
  background: #005f8a;
}

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

/* Mostrar total en grande */
.total-value {
  font-weight: 700;
  color: #0b3954;
}

/* mini-controls: input pequeño + boton eliminar */
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
.delete-btn:hover {
  background: #b52a33;
}

/* Mensaje fila vacía */
.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

/* Footer final */
.footer-venta {
  margin-top: auto; /* empuja al final */
  padding-top: 20px;
  border-top: 2px solid #ccc;
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

.total {
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
