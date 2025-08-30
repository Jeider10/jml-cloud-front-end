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
          <input v-model="venta.cantidad" type="number" />

          <label>Precio</label>
          <input v-model="venta.precio" type="number" />

          <label>Seleccionar:</label>
          <input v-model="venta.fecha" type="date" />
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
            <td>{{ item.precio }}</td>
            <td>{{ item.cantidad * item.precio }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Datos de cliente -->
      <div class="form-container">
        <div class="form-row">
          <label>DNI/RUC</label>
          <input v-model="cliente.dni" type="text" />

          <label>Nombre</label>
          <input v-model="cliente.nombre" type="text" />
        </div>
      </div>

      <!-- Footer de acciones -->
      <div class="acciones-footer">
        <button @click="imprimirFactura">🖨️ Imprimir</button>
        <span class="total">💰 Total a Pagar: {{ calcularTotal }}</span>
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
      items: [],
      cliente: {
        dni: '',
        nombre: ''
      }
    }
  },
  computed: {
    calcularTotal() {
      return this.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
    }
  },
  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },
    imprimirFactura() {
      alert('🖨️ Aquí iría la lógica para imprimir la factura.')
    }
  }
}
</script>

<style scoped>
.nueva-venta-wrapper {
  display: flex;
  height: 100vh;
  width: 100%;
}

/* Contenido principal */
.venta-container {
  flex: 1;
  margin-left: 60px; /* ancho colapsado del menú */
  padding: 20px;
  background-color: #6fffd4;
  overflow-y: auto;
  transition: margin-left 0.3s ease;
}

/* Si menú expandido, deja más espacio */
.venta-container.expanded {
  margin-left: 200px;
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
}

label {
  font-weight: bold;
}

input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

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
