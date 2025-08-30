<!-- src/components/proveedores/HistorialVentasView.vue -->

<template>
  <div class="historial-ventas-wrapper">
    <!-- Menú lateral -->
    <DashboardSideMenu @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['ventas-container', { expanded: menuOpen }]">
      <h1 class="titulo">Historial de Ventas</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Filtro de búsqueda -->
      <div class="form-filtro">
        <span style="font-weight: bold;">Buscar por Cliente, Producto o Vendedor:</span>
        <div style="display: flex; gap: 4px;">
          <input v-model="busqueda" type="text" placeholder="Ingrese término de búsqueda" />
          <button type="button"
                  class="buscar-btn"
                  :disabled="!hayDatosFiltro()"
                  @click="filtrarVentas">Buscar</button>
          <button type="button"
                  class="buscar-btn"
                  :disabled="!hayDatosFiltro()"
                  @click="limpiarBusqueda">Limpiar</button>
          <button type="button"
                  class="imprimir-btn"
                  @click="imprimirHistorial">🖨️ Imprimir</button>
        </div>
      </div>

      <!-- Tabla de ventas -->
      <table class="ventas-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>CLIENTE</th>
            <th>PRODUCTOS</th>
            <th>VENDEDOR</th>
            <th>TOTAL</th>
            <th>FECHA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venta, idx) in ventasFiltradas" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ venta.cliente }}</td>
            <td>
              <ul>
                <li v-for="(prod, i) in venta.productos" :key="i">{{ prod }}</li>
              </ul>
            </td>
            <td>{{ venta.vendedor }}</td>
            <td>{{ venta.total }}</td>
            <td>{{ venta.fecha }}</td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="6" class="empty-row">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'

export default {
  name: 'HistorialVentasView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: false,
      ventas: [],
      ventasFiltradas: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: ''
    }
  },
  mounted() {
    // Recuperar historial desde localStorage
    this.ventas = JSON.parse(localStorage.getItem('ventas')) || []
    this.ventasFiltradas = [...this.ventas]
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

    hayDatosFiltro() {
      return this.busqueda.trim().length > 0
    },

    filtrarVentas() {
      const texto = this.busqueda.toLowerCase()
      this.ventasFiltradas = this.ventas.filter(v =>
        v.cliente.toLowerCase().includes(texto) ||
        v.vendedor.toLowerCase().includes(texto) ||
        v.productos.some(p => p.toLowerCase().includes(texto))
      )
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.ventasFiltradas = [...this.ventas]
    },

    imprimirHistorial() {
      window.print()
    }
  }
}
</script>

<style scoped>
.historial-ventas-wrapper { display: flex; }
.ventas-container {
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
.ventas-container.expanded { left: 220px; }
.titulo { font-size: 2rem; font-weight: bold; margin-bottom: 20px; text-align: center; }
.mensaje { padding: 12px 18px; border-radius: 6px; margin-bottom: 15px; font-weight: bold; text-align: center; box-shadow: 0px 4px 8px rgba(0,0,0,0.15); }
.mensaje.success { background: #2ecc71; color: white; }
.mensaje.error   { background: #e74c3c; color: white; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.form-filtro { display: flex; flex-direction: column; flex-wrap: wrap; align-items: center; gap: 4px; margin-top: 20px; margin-bottom: 12px; }
input { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
.buscar-btn, .imprimir-btn { border-radius: 6px; border: none; cursor: pointer; font-weight: 600; padding: 6px 12px; }
.buscar-btn { background: #06d6a0; color: white; margin-left: 4px; }
.buscar-btn:hover { background: #049670; }
.buscar-btn:disabled { background: #ccc; cursor: not-allowed; }
.imprimir-btn { background: #0077b6; color: white; margin-left: 10px; }
.imprimir-btn:hover { background: #005f8a; }
.ventas-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
.ventas-table th, .ventas-table td { border: 1px solid #ddd; padding: 8px; text-align: center; background: white; }
.ventas-table ul { list-style: none; padding: 0; margin: 0; }
.ventas-table li { text-align: left; }
.empty-row { text-align: center; padding: 18px; color: #666; }
</style>
