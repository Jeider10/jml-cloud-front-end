<!-- src/components/ticket/TicketFactura.vue -->

<template>
  <div class="ticket">
    <!-- 🏪 Encabezado -->
    <div class="center">
      <h2>{{ empresa.nombre }}</h2>
      <p>NIT: {{ empresa.nit }}</p>
      <p>{{ empresa.direccion }}</p>
      <p>Tel: {{ empresa.telefono }}</p>
    </div>

    <hr />

    <!-- 📄 Datos de factura -->
    <p>Factura #: {{ factura.numero }}</p>
    <p>Fecha: {{ factura.fecha }}</p>
    <p>Cliente: {{ factura.cliente }}</p>

    <hr />

    <!-- 📦 Productos -->
    <div class="item" v-for="(p, i) in factura.productos" :key="i">
      <div>{{ p.nombre }}</div>
      <div class="line">
        <span>{{ p.cantidad }} x {{ precio(p.precio) }}</span>
        <span>{{ precio(p.cantidad * p.precio) }}</span>
      </div>
    </div>

    <hr />

    <!-- 💰 Totales -->
    <div class="line bold">
      <span>TOTAL</span>
      <span>{{ precio(factura.total) }}</span>
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
