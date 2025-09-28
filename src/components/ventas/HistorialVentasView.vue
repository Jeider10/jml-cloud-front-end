<!-- src/components/proveedores/HistorialVentasView.vue -->

<template>
  <div class="historial-ventas-wrapper">
    <!-- Menú lateral (oculto en impresión) -->
    <DashboardSideMenu class="no-print" @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['ventas-container', { expanded: menuOpen }]">
      <h1 class="titulo">Historial de Ventas</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo, 'no-print']">
          {{ mensaje }}
        </div>
      </transition>

      <!-- Filtro de búsqueda -->
      <div class="form-filtro no-print">
        <span class="buscar-label">Buscar por Cliente, Producto o Vendedor:</span>
        <div style="display: flex; gap: 4px;">
          <input v-model="busqueda" type="text" placeholder="Ingrese término de búsqueda" />
          <button type="button" class="buscar-btn" :disabled="!hayDatosFiltro()" @click="filtrarVentas">Buscar</button>
          <button type="button" class="buscar-btn" :disabled="!hayDatosFiltro()" @click="limpiarBusqueda">Limpiar</button>
          <button type="button" class="imprimir-btn" @click="imprimirHistorial">🖨️ Imprimir</button>
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

      <!-- Footer final con Total a Pagar -->
      <div class="footer-ventas">
        <span class="total">💰 Total a Ventas: {{ totalGeneral }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import { listarTodasLasOrdenes } from '@/services/apiOrdersService'

export default {
  name: 'HistorialVentasView',
  components: { DashboardSideMenu },
  data() {
    return {
      menuOpen: true, // Siempre arranca expandido y false arranca oculto
      ventas: [],
      ventasFiltradas: [],
      mensaje: '',
      mensajeTipo: '',
      busqueda: ''
    }
  },

  async mounted() {
    await this.buscarTodasLasOrdenes()
  },

  methods: {
    // handleMenuToggle(state) {
      // this.menuOpen = state // Se descomenta cuando menuOpen: false
    // },

    // 🔹 Cargar todas las órdenes al iniciar
    async buscarTodasLasOrdenes() {
      try {
        const response = await listarTodasLasOrdenes()
        this.ventas = response.data.map(o => ({
          cliente: o.clienteNombre,
          productos: o.detalles.map(d => d.productoNombre),
          vendedor: o.vendedor,
          total: o.total,
          fecha: o.fecha
        }))
        this.ventasFiltradas = [...this.ventas]
      } catch (error) {
        console.error('❌ Error al cargar historial de ventas:', error)
        this.mostrarMensaje(error.message || 'Error al cargar historial de ventas', 'error')
        this.ventas = []
        this.ventasFiltradas = []
      }
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
  },

  // 🔹 Calcula el total general de todas las ventas filtradas
  computed: {
    totalGeneral() {
      return this.ventasFiltradas
        .reduce((acc, v) => acc + parseFloat(v.total || 0), 0)
        .toFixed(2)
    }
  }
}
</script>


<style scoped>
.historial-ventas-wrapper {
  display: flex;
}
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
  margin-left: 0px !important; /* <-- ajusta este valor a lo que necesites */
  margin-right: 0px !important; /* <-- ajusta este valor a lo que necesites */
}

.ventas-container.expanded { left: 220px; }

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: -10px;    /* espacio desde arriba */
}

.buscar-label {
  display: block;       /* para que respete el margen como línea */
  margin-top: -20px;    /* sube el texto hacia arriba */
  font-weight: bold;
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
.mensaje.error { background: #e74c3c; color: white; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.form-filtro {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
  margin-bottom: 12px;
}
input { padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
.buscar-btn, .imprimir-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 12px;
}
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

/* 🔹 Footer fijo al final */
.footer-ventas {
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid #ccc;
  text-align: right;
}
.total { font-size: 1.2rem; font-weight: bold; }

@media print {
  .no-print { display: none !important; }

  .ventas-container {
    position: relative !important;
    left: 0 !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    padding: 0 !important;
    background: white !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important; /* centra todo horizontalmente */
  }

  .titulo {
    text-align: center !important;
    margin-bottom: 20px !important;
  }

  .form-filtro {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important; /* centra el formulario */
    margin-bottom: 20px !important;
  }

  .ventas-table {
    width: auto !important; /* que la tabla se ajuste al contenido */
    min-width: 600px; /* opcional, para que no quede muy estrecha */
    border-collapse: collapse !important;
  }

  .ventas-table th, .ventas-table td {
    border: 1px solid #ddd !important;
    padding: 8px !important;
    text-align: center !important;
    background: white !important;
  }

  .form-filtro.no-print {
    display: none !important;
  }

  .footer-ventas {
    text-align: right !important;
    position: fixed !important;
    bottom: 20px !important;
    width: 100% !important;
    padding: 0 20px !important;
  }
}
</style>
