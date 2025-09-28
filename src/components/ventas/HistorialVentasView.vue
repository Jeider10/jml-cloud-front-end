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

      <!-- 🔍 Filtro de búsqueda -->
      <div class="form-filtro no-print">
        <span class="buscar-label">Buscar por:</span>
        <div style="display: flex; gap: 4px;">
          <select v-model="tipoBusqueda">
            <option disabled value="">Seleccione una opción</option>
            <option value="cliente">Cliente</option>
            <option value="idCliente">ID. Cliente</option>
            <option value="producto">Productos</option>
            <option value="vendedor">Vendedor</option>
            <option value="idVendedor">ID. Vendedor</option>
            <option value="factura">Nro. Factura</option>
          </select>

          <input v-model="busqueda"
                 type="text"
                 placeholder="Ingrese término de búsqueda"
                 :disabled="!tipoBusqueda" />

          <button type="button"
                  class="buscar-btn"
                  :disabled="!hayDatosFiltro() || !tipoBusqueda"
                  @click="filtrarVentas">
                  🔍 Buscar
          </button>

          <button type="button"
                  class="buscar-btn"
                  :disabled="!hayDatosFiltro() || !tipoBusqueda"
                  @click="limpiarBusqueda">
                  🧹 Limpiar
          </button>

          <button type="button"
                  class="imprimir-btn"
                  @click="imprimirHistorial">
                  🖨️ Imprimir
          </button>
        </div>
      </div>

      <!-- Tabla de ventas -->
      <table class="ventas-table">
        <thead>
          <tr>
            <th>#</th>
            <th>CLIENTE</th>
            <th>ID. CLIENTE</th>
            <th>PRODUCTOS</th>
            <th>P. UNITARIO</th>
            <th>SUBTOTAL</th>
            <th>TOTAL</th>
            <th>VENDEDOR</th>
            <th>ID. VENDEDOR</th>
            <th>NRO. FACTURA</th>
            <th>FECHA</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(venta, idx) in ventasFiltradas" :key="idx">
            <td>{{ idx + 1 }}</td>
            <td>{{ venta.cliente }}</td>
            <td>{{ venta.identificacionCliente }}</td>
            <td>
              <ul>
                <li v-for="(prod, i) in venta.productos" :key="i">
                  {{ prod.producto }} (x{{ prod.cantidad }})
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li v-for="(prod, i) in venta.productos" :key="i">
                  {{ prod.precio }}
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li v-for="(prod, i) in venta.productos" :key="i">
                  {{ (prod.precio * prod.cantidad).toFixed(2) }}
                </li>
              </ul>
            </td>
            <td>{{ venta.total }}</td>
            <td>{{ venta.vendedor }}</td>
            <td>{{ venta.identificacionVendedor }}</td>
            <td>{{ venta.numeroFactura }}</td>
            <td>{{ venta.fecha }}</td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="11" class="empty-row">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>

      <!-- Footer final con Total a Pagar -->
      <div class="footer-ventas">
        <span class="total">💰 Total de Ventas: {{ totalGeneral }}</span>
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
      busqueda: '',
      tipoBusqueda: ''
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
          cliente: o.nombreCliente,
          identificacionCliente: o.identificacionCliente,
          productos: o.detalles.map(d => ({
            producto: d.producto,
            cantidad: d.cantidad,
            precio: d.precio
          })),
          vendedor: o.nombreEmpleado,
          identificacionVendedor: o.identificacionEmpleado,
          total: o.totalCompra,
          numeroFactura: o.numeroFactura,
          fecha: o.fechaCreacion
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
      switch (this.tipoBusqueda) {
        case 'cliente':
          this.ventasFiltradas = this.ventas.filter(v =>
            v.cliente.toLowerCase().includes(texto)
          )
          break
        case 'idCliente':
          this.ventasFiltradas = this.ventas.filter(v =>
            v.identificacionCliente && v.identificacionCliente.toString().toLowerCase().includes(texto)
          )
          break
        case 'producto':
          this.ventasFiltradas = this.ventas.filter(v =>
            v.productos.some(p => p.producto.toLowerCase().includes(texto))
          )
          break
        case 'vendedor':
          this.ventasFiltradas = this.ventas.filter(v =>
            v.vendedor.toLowerCase().includes(texto)
          )
          break
        case 'idVendedor':
          this.ventasFiltradas = this.ventas.filter(v =>
            v.identificacionVendedor && v.identificacionVendedor.toString().toLowerCase().includes(texto)
          )
          break
        case 'factura':
          this.ventasFiltradas = this.ventas.filter(v =>
            v.numeroFactura && v.numeroFactura.toString().toLowerCase().includes(texto)
          )
          break
        default:
          this.ventasFiltradas = [...this.ventas]
      }
    },

    limpiarBusqueda() {
      this.busqueda = ''
      this.tipoBusqueda = ''
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
    align-items: center !important;
  }

  .titulo {
    text-align: center !important;
    margin-bottom: 20px !important;
  }

  .form-filtro.no-print {
    display: none !important;
  }

  .ventas-table {
    width: 100% !important;          /* ocupa todo el ancho de la hoja */
    table-layout: fixed !important;  /* fija proporciones de columnas */
    font-size: 12px !important;      /* reduce tamaño de letra para caber */
    border-collapse: collapse !important;
    word-break: break-word !important;
  }

  .ventas-table th, .ventas-table td {
    border: 1px solid #000 !important;
    padding: 4px !important;         /* reduce padding para impresión */
    text-align: center !important;
    background: white !important;
    white-space: normal !important;  /* permite salto de línea dentro de celdas */
  }

  .footer-ventas {
    text-align: right !important;
    position: fixed !important;
    bottom: 20px !important;
    width: 100% !important;
    padding: 0 20px !important;
    font-size: 12px !important;      /* más pequeño para impresión */
  }
}

</style>
