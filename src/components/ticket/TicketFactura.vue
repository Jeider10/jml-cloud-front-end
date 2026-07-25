<!-- src/components/ticket/TicketFactura.vue -->

<template>
  <div class="ticket">
    <!-- Encabezado empresa -->
    <div class="center">
      <h2>{{ empresa.nombre || 'MI NEGOCIO' }}</h2>
      <p v-if="empresa.nit">NIT: {{ empresa.nit }}</p>
      <p>{{ empresaInfo }}</p>
    </div>

    <div class="separator"></div>

    <!-- Datos de factura -->
    <div class="line">
      <span>Factura #:</span>
      <span>{{ factura.numero }}</span>
    </div>

    <div class="line">
      <span>Generacion:</span>
      <span>{{ factura.fecha }}</span>
    </div>

    <div class="line">
      <span>Validacion Dian:</span>
      <span>{{ factura.fecha }}</span>
    </div>

    <div class="separator"></div>

    <div class="line">
      <span>Cliente:</span>
      <span>{{ factura.clienteNombre }}</span>
    </div>
    <div class="line">
      <span>C.C:</span>
      <span>{{ factura.clienteCC }}</span>
    </div>
    <div class="line">
      <span>Atendido por:</span>
      <span>{{ factura.vendedorNombre }}</span>
    </div>
    <div class="line">
      <span>C.C:</span>
      <span>{{ factura.vendedorCC }}</span>
    </div>

    <div class="separator"></div>

    <!-- Productos -->
    <div class="productos">
      <div class="center bold">DETALLE</div>

      <!-- Cabecera -->
      <div class="table-header">
        <span class="col-nombre">Producto</span>
        <span class="col-desc">Desc</span>
        <span class="col-cant">Cant</span>
        <span class="col-precio">Total</span>
      </div>

      <!-- Filas -->
      <div class="table-row" v-for="(p, i) in factura.productos" :key="i">
        <span class="col-nombre">{{ p.nombre }}</span>
        <span class="col-desc">{{ p.descripcion || '-' }}</span>
        <span class="col-cant">x{{ p.cantidad }}</span>
        <span class="col-precio">{{ precio(p.cantidad * p.precio) }}</span>
      </div>
    </div>

    <div class="separator"></div>

    <!-- Totales -->
    <div class="line">
      <span>SUBTOTAL:</span>
      <span>{{ precio(subtotal) }}</span>
    </div>

    <div class="line">
      <span>IVA (19%):</span>
      <span>{{ precio(iva) }}</span>
    </div>

    <div v-if="descuento > 0" class="line">
      <span>DESCUENTO {{ descuentoInfo }}:</span>
      <span>-{{ precio(descuento) }}</span>
    </div>

    <div class="line bold total-line">
      <span>TOTAL A PAGAR:</span>
      <span>{{ precio(totalFinal) }}</span>
    </div>

    <div class="separator"></div>

    <!-- Pago -->
    <div class="line">
      <span>Recibido:</span>
      <span>{{ precio(recibido) }}</span>
    </div>

    <div class="line bold">
      <span>Cambio:</span>
      <span>{{ precio(cambio) }}</span>
    </div>

    <div class="separator"></div>

    <!-- Factura electronica -->
    <div class="factura-electronica center">
      <p class="titulo-fe">Factura Electronica de Venta</p>

      <!-- Numero factura -->
      <p class="codigo-fe">{{ factura.numero }}</p>

      <!-- CUFE -->
      <p class="cufe-label">CUFE:</p>
      <p class="cufe">{{ cufe }}</p>

      <!-- QR -->
      <div class="qr-container">
        <qrcode-vue
            :value="qrData"
            :size="90"
            level="M"
        />
      </div>

      <!-- Texto DIAN -->
      <p class="dian-text">
        Documento equivalente POS - No valido como factura electronica DIAN
      </p>
    </div>

    <div class="separator"></div>

    <!-- Pie -->
    <p class="center footer-msg">Gracias por su compra</p>
    <p class="center footer-msg">No valido como titulo valor</p>
    <div class="ticket-end"></div>
  </div>
</template>


<script>
import QrcodeVue from 'qrcode.vue'

export default {
  name: 'TicketFactura',

  components: {
    QrcodeVue
  },

  props: {
    empresa: {
      type: Object,
      required: true
    },

    factura: {
      type: Object,
      required: true
    },

    recibido: {
      type: Number,
      default: 0
    },

    descuento: {
      type: Number,
      default: 0
    },

    descuentoInfo: {
      type: String,
      default: ''
    }
  },

  data() {
    return {}
  },

  computed: {
    empresaInfo() {
      const parts = []
      if (this.empresa.direccion) parts.push(`Dir: ${this.empresa.direccion}`)
      if (this.empresa.telefono) parts.push(`Tel: ${this.empresa.telefono}`)
      return parts.join(' | ') || ''
    },

    subtotal() {
      return this.factura.total || 0
    },

    iva() {
      // IVA extraido del precio (ya incluido): IVA = total - (total / 1.19)
      return Math.round(this.subtotal - (this.subtotal / 1.19))
    },

    totalFinal() {
      // Si la factura ya trae totalFinal calculado, usarlo directamente
      if (this.factura.totalFinal !== undefined && this.factura.totalFinal !== null) {
        return this.factura.totalFinal
      }
      // Fallback: el total a pagar es el subtotal menos el descuento
      return Math.max(this.subtotal - this.descuento, 0)
    },

    cambio() {
      return Math.max(this.recibido - this.totalFinal, 0)
    },

    cufe() {
      try {
        return btoa(
            `${this.empresa.nit || ''}|${this.factura.numero || ''}|${this.totalFinal}|${this.factura.fecha || ''}`
        )
      } catch {
        return 'N/A'
      }
    },

    qrData() {
      return [
        `NIT:${this.empresa.nit || ''}`,
        `FACTURA:${this.factura.numero || ''}`,
        `FECHA:${this.factura.fecha || ''}`,
        `TOTAL:${this.totalFinal}`,
        `CLIENTE:${this.factura.clienteNombre || 'CONSUMIDOR FINAL'}`,
        `VENDEDOR:${this.factura.vendedorNombre || 'CAJERO'}`,
        `CUFE:${this.cufe}`
      ].join('\n')
    }
  },

  methods: {
    precio(valor) {
      if (valor === null || valor === undefined || isNaN(valor)) return '$0'
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor)
    }
  }
}
</script>


<style scoped>
/* ============================== */
/* Estilos del ticket POS         */
/* ============================== */

.ticket {
  width: 58mm;
  font-family: 'Courier New', Courier, monospace;
  font-size: 9px;
  color: #000;
  line-height: 1.4;
  padding: 4px 2px;
}

.center {
  text-align: center;
}

.bold {
  font-weight: bold;
}

/* Separador tipo POS */
.separator {
  border: none;
  border-top: 1px dashed #000;
  margin: 5px 0;
}

/* Encabezado */
.ticket h2 {
  margin: 0 0 2px 0;
  padding: 0;
  font-size: 12px;
  line-height: 1.3;
  text-transform: uppercase;
}

.ticket p {
  margin: 0;
  padding: 0;
  line-height: 1.3;
}

/* Lineas clave:valor */
.line {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  padding: 1px 0;
}

.line span:first-child {
  white-space: nowrap;
  flex-shrink: 0;
}

.line span:last-child {
  text-align: right;
  word-break: break-word;
}

.total-line {
  font-size: 10px;
  padding: 3px 0;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  margin: 2px 0;
}

/* Tabla de productos */
.productos {
  margin-top: 4px;
}

.table-header,
.table-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2px;
}

.table-header {
  font-weight: bold;
  border-bottom: 1px dashed #000;
  margin-bottom: 2px;
  padding-bottom: 2px;
}

.col-nombre {
  width: 28%;
  text-align: left;
  font-size: 8px;
  word-break: break-word;
}

.col-desc {
  width: 30%;
  text-align: left;
  font-size: 7px;
  white-space: normal;
  word-break: break-word;
}

.col-cant {
  width: 12%;
  text-align: center;
  font-size: 8px;
}

.col-precio {
  width: 30%;
  text-align: right;
  font-size: 8px;
}

/* Factura electronica */
.factura-electronica {
  margin-top: 4px;
}

.titulo-fe {
  font-size: 8px;
  font-weight: bold;
  text-transform: uppercase;
}

.codigo-fe {
  font-size: 9px;
  letter-spacing: 1px;
  font-weight: bold;
}

.qr-container {
  margin: 6px 0 4px 0;
  display: flex;
  justify-content: center;
}

.cufe-label {
  font-size: 7px;
  margin-top: 3px;
  font-weight: bold;
}

.cufe {
  font-size: 6px;
  word-break: break-all;
  line-height: 1.2;
}

.dian-text {
  font-size: 7px;
  margin-top: 4px;
  font-style: italic;
}

.footer-msg {
  font-size: 8px;
  margin-top: 2px;
}

/* Espacio final para corte de papel */
.ticket-end {
  height: 10mm;
}

/* ============================== */
/* Estilos de impresion            */
/* ============================== */
@media print {
  @page {
    size: 58mm auto;
    margin: 0;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
  }

  .ticket {
    width: 48mm !important;
    margin: 0 auto;
    padding: 2px;
  }
}
</style>
