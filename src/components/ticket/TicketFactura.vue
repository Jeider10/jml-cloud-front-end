<!-- src/components/ticket/TicketFactura.vue -->

<template>
  <div class="ticket">
    <!-- 🏪 Encabezado -->
    <div class="center">
      <h2>{{ empresa.nombre }}</h2>
      <p>NIT: {{ empresa.nit }}</p>
      <p>{{ empresaInfo }}</p>
    </div>

    <hr />

    <!-- 📄 Datos de factura -->
    <p>Factura #: {{ factura.numero }}</p>
    <p>Fecha: {{ factura.fecha }}</p>
    <p>Cliente: {{ factura.cliente }}</p>

    <hr />

    <!-- 📦 Productos -->
    <div class="productos">

      <!-- 🔸 Título -->
      <div class="center bold">DETALLE</div>

      <!-- 🔸 Cabecera -->
      <div class="table-header">
        <span class="col-nombre">Producto</span>
        <span class="col-desc">Desc</span>
        <span class="col-cant">Cant</span>
        <span class="col-precio">Total</span>
      </div>

      <!-- 🔸 Filas -->
      <div class="table-row" v-for="(p, i) in factura.productos" :key="i">
        <span class="col-nombre">{{ p.nombre }}</span>
        <span class="col-desc">{{ p.descripcion || '-' }}</span>
        <span class="col-cant">x{{ p.cantidad }}</span>
        <span class="col-precio">{{ precio(p.cantidad * p.precio) }}</span>
      </div>

    </div>

    <hr />

    <!-- 💰 Totales -->
    <div class="line">
      <span>SUBTOTAL</span>
      <span>{{ precio(subtotal) }}</span>
    </div>

    <div class="line">
      <span>IVA (19%)</span>
      <span>{{ precio(iva) }}</span>
    </div>

    <div class="line bold">
      <span>TOTAL A PAGAR</span>
      <span>{{ precio(totalFinal) }}</span>
    </div>

    <hr />

    <!-- 💵 Pago -->
    <div class="line">
      <span>Recibido</span>
      <span>{{ precio(recibido) }}</span>
    </div>

    <div class="line bold">
      <span>Cambio</span>
      <span>{{ precio(cambio) }}</span>
    </div>

    <hr />

    <!-- 🙏 Pie -->
    <p class="center">Gracias por su compra</p>
    <p class="center">No válido como título valor</p>
  </div>
</template>


<script>
export default {
  name: 'TicketFactura',
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
    }
  },

  data() {

  },

  computed: {
    empresaInfo() {
      return `Dir: ${this.empresa.direccion || '-'} | Tel: ${this.empresa.telefono || '-'}`
    },

    subtotal() {
      return this.factura.total || 0
    },

    iva() {
      return this.subtotal * 0.19
    },

    totalFinal() {
      return this.subtotal + this.iva
    },

    cambio() {
      return Math.max(this.recibido - this.totalFinal, 0)
    }
  },

  methods: {
    precio(valor) {
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
.productos {
  margin-top: 5px;
}

.table-header,
.table-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.table-header {
  font-weight: bold;
  border-bottom: 1px dashed black;
  margin-bottom: 3px;
}

/* 🔥 Ajuste tipo POS */
.col-nombre {
  width: 28%;
  text-align: left;
}

.col-desc {
  width: 32%;
  text-align: left;
  font-size: 10px;
  white-space: normal; /* 🔥 permite salto de línea */
  word-break: break-word; /* 🔥 rompe palabras largas */
}

.col-cant {
  width: 10%;
  text-align: center;
}

.col-precio {
  width: 30%;
  text-align: right;
}

.ticket {
  width: 58mm;
  font-family: monospace;
  font-size: 11px;
}

.center {
  text-align: center;
}

.line {
  display: flex;
  justify-content: space-between;
}

.bold {
  font-weight: bold;
}

hr {
  border: none;
  border-top: 1px dashed black;
  margin: 4px 0;
}

@media print {
  body {
    margin: 0;
  }
}
</style>
