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
        <div style="display: flex; gap: 4px">
          <select v-model="tipoBusqueda">
            <option disabled value="">Seleccione una opción</option>
            <option value="cliente">Cliente</option>
            <option value="idCliente">ID. Cliente</option>
            <option value="producto">Productos</option>
            <option value="vendedor">Vendedor</option>
            <option value="idVendedor">ID. Vendedor</option>
            <option value="estado">Estado</option>
            <option value="factura">Nro. Factura</option>
            <option value="fechaCreacion">Fecha</option>
          </select>

          <!-- Select de estado (solo cuando tipoBusqueda es estado) -->
          <select v-if="tipoBusqueda === 'estado'" v-model="busqueda">
            <option disabled value="">Seleccione un estado</option>
            <option value="ABIERTA">ABIERTA</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="CERRADA">CERRADA</option>
          </select>

          <input
            v-else-if="tipoBusqueda !== 'fechaCreacion'"
            v-model="busqueda"
            type="text"
            placeholder="Ingrese término de búsqueda"
            :disabled="!tipoBusqueda"
          />

          <!-- 📅 Selector de rango de fecha estilo CloudWatch -->
          <DateRangePicker
            v-if="tipoBusqueda === 'fechaCreacion'"
            @aplicar="onFechaRangoAplicar"
          />

          <button
            type="button"
            class="buscar-btn"
            :disabled="!puedeFiltrarse"
            @click="filtrarVentas"
          >
            🔍 Buscar
          </button>

          <button
            type="button"
            class="buscar-btn"
            :disabled="!puedeFiltrarse && tipoBusqueda !== 'fechaCreacion'"
            @click="limpiarBusqueda"
          >
            🧹 Limpiar
          </button>

          <button type="button" class="imprimir-btn" @click="imprimirHistorial">
            🖨️ Imprimir
          </button>

          <!-- 🔹 Checkbox: Ver solo mis ventas (solo ADMIN) -->
          <label
            v-if="isAdmin"
            style="
              display: flex;
              align-items: center;
              gap: 4px;
              margin-left: 8px;
              font-size: 13px;
              cursor: pointer;
            "
          >
            <input
              type="checkbox"
              v-model="filtrarPorMiUsuario"
              @change="aplicarFiltroUsuario"
            />
            Ver solo mis ventas
          </label>
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
            <th>DESCUENTO</th>
            <th>TOTAL</th>
            <th>ABONADO</th>
            <th>ESTADO</th>
            <th>COMENTARIO</th>
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
                  {{ formatPrecioCOP(prod.precio) }}
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li v-for="(prod, i) in venta.productos" :key="i">
                  {{ formatPrecioCOP(subtotalProducto(prod)) }}
                </li>
              </ul>
            </td>
            <td>
              <span v-if="venta.descuentoAplicado > 0">
                {{
                  venta.descuentoTipo === "PORCENTAJE"
                    ? venta.descuentoValor + "%"
                    : ""
                }}
                -{{ formatPrecioCOP(venta.descuentoAplicado) }}
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ formatPrecioCOP(totalVenta(venta)) }}</td>
            <td>
              <span
                v-if="venta.estado === 'PENDIENTE'"
                style="color: #e67e22; font-weight: bold"
              >
                {{ formatPrecioCOP(venta.valorRecibido || 0) }}
              </span>
              <span v-else>-</span>
            </td>
            <td>
              <span
                :style="{
                  color:
                    venta.estado === 'PENDIENTE'
                      ? '#e67e22'
                      : venta.estado === 'CERRADA'
                        ? '#27ae60'
                        : venta.estado === 'ABIERTA'
                          ? '#0077b6'
                          : '#333',
                  fontWeight: 'bold',
                }"
              >
                {{ venta.estado }}
              </span>
            </td>
            <td>
              <span v-if="venta.comentario && venta.estado === 'PENDIENTE'">
                📝 {{ venta.comentario }}
              </span>
              <span
                v-else-if="venta.comentario && venta.estado === 'CERRADA'"
                style="font-size: 11px"
              >
                📝 {{ venta.comentario }} <br /><span
                  style="color: #27ae60; font-weight: bold"
                  >✅ PAGADO</span
                >
              </span>
              <span v-else>-</span>
            </td>
            <td>{{ venta.vendedor }}</td>
            <td>{{ venta.identificacionVendedor }}</td>
            <td>{{ venta.numeroFactura }}</td>
            <td>{{ venta.fecha }}</td>
          </tr>
          <tr v-if="ventasFiltradas.length === 0">
            <td colspan="15" class="empty-row">No hay ventas registradas.</td>
          </tr>
        </tbody>
      </table>

      <!-- Footer final con Total a Pagar -->
      <div class="footer-ventas">
        <span class="total">💰 Total Ventas: {{ totalGeneral }}</span>
        <span
          v-if="hayPendientes"
          class="total"
          style="color: #e67e22; margin-left: 20px"
          >⏳ Abonado (pendientes): {{ totalAbonado }}</span
        >
        <span
          v-if="hayPendientes"
          class="total"
          style="color: #c0392b; margin-left: 20px"
          >❗ Por cobrar: {{ totalPendiente }}</span
        >
      </div>
    </div>
  </div>
</template>

<script>
import DashboardSideMenu from "@/views/dashboard/DashboardSideMenu.vue";
import DateRangePicker from "@/components/common/DateRangePicker.vue";
import {
  listarTodasLasOrdenes,
  buscarOrdenesPorFechaCreacion,
  buscarOrdenesPorCliente,
  buscarOrdenesPorIdCliente,
  buscarOrdenesPorVendedor,
  buscarOrdenesPorIdVendedor,
  buscarOrdenesPorFactura,
  buscarOrdenesPorProducto,
  buscarOrdenesPorEstado,
} from "@/services/apiOrdersService";
import { getSession } from "@/services/apiAuthService";

export default {
  name: "HistorialVentasView",
  components: { DashboardSideMenu, DateRangePicker },
  data() {
    return {
      menuOpen: localStorage.getItem("menuPinned") === "true", // Siempre arranca expandido y false arranca oculto
      ventas: [],
      ventasFiltradas: [],
      mensaje: "",
      mensajeTipo: "",
      busqueda: "",
      tipoBusqueda: "",
      fechaRango: { fechaInicio: "", fechaFin: "" },
      filtrarPorMiUsuario: false,
    };
  },

  // 🔹 Calcula el total general de todas las ventas filtradas
  computed: {
    // Solo suma las ventas CERRADAS + lo abonado en PENDIENTE
    totalGeneral() {
      const totalCerradas = this.ventasFiltradas
        .filter((v) => v.estado === "CERRADA")
        .reduce((acc, v) => acc + this.totalVenta(v), 0);

      const totalAbonos = this.ventasFiltradas
        .filter((v) => v.estado === "PENDIENTE")
        .reduce((acc, v) => acc + (v.valorRecibido || 0), 0);

      return this.formatPrecioCOP(totalCerradas + totalAbonos);
    },

    // Suma de abonos en ventas PENDIENTE
    totalAbonado() {
      const total = this.ventasFiltradas
        .filter((v) => v.estado === "PENDIENTE")
        .reduce((acc, v) => acc + (v.valorRecibido || 0), 0);

      return this.formatPrecioCOP(total);
    },

    // Total pendiente por cobrar
    totalPendiente() {
      const total = this.ventasFiltradas
        .filter((v) => v.estado === "PENDIENTE")
        .reduce(
          (acc, v) => acc + (this.totalVenta(v) - (v.valorRecibido || 0)),
          0,
        );

      return this.formatPrecioCOP(total);
    },

    hayPendientes() {
      return this.ventasFiltradas.some((v) => v.estado === "PENDIENTE");
    },

    // 🔹 Detecta si el usuario logueado es ADMIN
    isAdmin() {
      const session = getSession();
      const role = (session?.user?.roleName || "").toUpperCase().trim();
      return ["ADMIN", "ADMINISTRADOR", "SUPERADMIN"].includes(role);
    },
    puedeFiltrarse() {
      if (!this.tipoBusqueda) return false;
      if (this.tipoBusqueda === "fechaCreacion") {
        return (
          this.fechaRango.fechaInicio !== "" && this.fechaRango.fechaFin !== ""
        );
      }
      return this.busqueda.trim().length > 0;
    },
  },

  async mounted() {
    await this.buscarTodasLasOrdenes();
  },

  methods: {
    // Revisar porque se descomento o si no comentarlo
    handleMenuToggle(state) {
      this.menuOpen = state; // Se descomenta cuando menuOpen: false
    },

    // 🔹 Cargar todas las órdenes al iniciar
    async buscarTodasLasOrdenes() {
      try {
        const response = await listarTodasLasOrdenes();
        let ordenes = (response.data || []).map((o) => ({
          cliente: o.nombreCliente,
          identificacionCliente: o.identificacionCliente,
          productos: (o.detalles || []).map((d) => ({
            producto: d.producto,
            cantidad: d.cantidad,
            precio: d.precio,
          })),
          vendedor: o.nombreEmpleado,
          identificacionVendedor: o.identificacionEmpleado,
          total:
            this.calcularTotalDetalles(o.detalles || []) -
            (o.descuentoAplicado || 0),
          descuentoAplicado: o.descuentoAplicado || 0,
          descuentoTipo: o.descuentoTipo || null,
          descuentoValor: o.descuentoValor || 0,
          estado: o.estadoOrden || "CERRADA",
          comentario: o.comentario || "",
          valorRecibido: o.valorRecibido || 0,
          numeroFactura: o.numeroFactura,
          fecha: o.fechaCreacion,
        }));

        // 🔹 Si el usuario es CAJERO/USER, filtrar solo sus ventas
        const session = getSession();
        const roleName = (session?.user?.roleName || "").toUpperCase().trim();
        const rolesUsuario = ["USER", "USUARIO", "CAJERO"];

        if (rolesUsuario.includes(roleName) && session?.user?.identificacion) {
          const miId = Number(session.user.identificacion);
          ordenes = ordenes.filter(
            (o) => Number(o.identificacionVendedor) === miId,
          );
        }

        this.ventas = ordenes;
        // El backend ya devuelve ordenado por fecha de creacion
        this.ventasFiltradas = [...this.ventas];
      } catch (error) {
        console.error("❌ Error al cargar historial de ventas:", error);
        this.mostrarMensaje(
          error.message || "Error al cargar historial de ventas",
          "error",
        );
        this.ventas = [];
        this.ventasFiltradas = [];
      }
    },

    mostrarMensaje(texto, tipo = "success") {
      this.mensaje = texto;
      this.mensajeTipo = tipo;
      setTimeout(() => {
        this.mensaje = "";
      }, 3000);
    },

    hayDatosFiltro() {
      return this.busqueda.trim().length > 0;
    },

    async filtrarVentas() {
      // Caso especial: busqueda por fecha via API
      if (this.tipoBusqueda === "fechaCreacion") {
        return this.filtrarVentasPorFecha();
      }

      const texto = this.busqueda;

      try {
        let response;

        switch (this.tipoBusqueda) {
          case "cliente":
            response = await buscarOrdenesPorCliente(texto);
            break;
          case "idCliente":
            response = await buscarOrdenesPorIdCliente(Number(texto));
            break;
          case "producto":
            response = await buscarOrdenesPorProducto(texto);
            break;
          case "vendedor":
            response = await buscarOrdenesPorVendedor(texto);
            break;
          case "idVendedor":
            response = await buscarOrdenesPorIdVendedor(Number(texto));
            break;
          case "factura":
            response = await buscarOrdenesPorFactura(texto);
            break;
          case "estado":
            response = await buscarOrdenesPorEstado(texto);
            break;
          default:
            response = await listarTodasLasOrdenes();
        }

        // Si 204 No Content
        if (response.status === 204 || !response.data) {
          this.ventasFiltradas = [];
          this.mostrarMensaje(
            "⚠️ No se encontraron ventas con ese filtro.",
            "warning",
          );
          return;
        }

        // Mapear respuesta
        const ordenes = Array.isArray(response.data)
          ? response.data
          : [response.data];
        this.ventasFiltradas = ordenes.map((o) => ({
          cliente: o.nombreCliente,
          identificacionCliente: o.identificacionCliente,
          productos: (o.detalles || []).map((d) => ({
            producto: d.producto,
            cantidad: d.cantidad,
            precio: d.precio,
          })),
          vendedor: o.nombreEmpleado,
          identificacionVendedor: o.identificacionEmpleado,
          total:
            this.calcularTotalDetalles(o.detalles || []) -
            (o.descuentoAplicado || 0),
          descuentoAplicado: o.descuentoAplicado || 0,
          descuentoTipo: o.descuentoTipo || null,
          descuentoValor: o.descuentoValor || 0,
          estado: o.estadoOrden || "CERRADA",
          comentario: o.comentario || "",
          valorRecibido: o.valorRecibido || 0,
          numeroFactura: o.numeroFactura,
          fecha: o.fechaCreacion,
        }));

        // 🔹 Si el check "Ver solo mis ventas" está activo (ADMIN), filtrar
        if (this.filtrarPorMiUsuario) {
          const session = getSession();
          if (session?.user?.identificacion) {
            const miId = Number(session.user.identificacion);
            this.ventasFiltradas = this.ventasFiltradas.filter(
              (v) => Number(v.identificacionVendedor) === miId,
            );
          }
        }

        // 🔹 Si es USER/CAJERO, filtrar solo sus ventas
        const session2 = getSession();
        const roleName = (session2?.user?.roleName || "").toUpperCase().trim();
        const rolesUsuario = ["USER", "USUARIO", "CAJERO"];
        if (rolesUsuario.includes(roleName) && session2?.user?.identificacion) {
          const miId = Number(session2.user.identificacion);
          this.ventasFiltradas = this.ventasFiltradas.filter(
            (v) => Number(v.identificacionVendedor) === miId,
          );
        }

        this.mostrarMensaje(
          `✅ ${this.ventasFiltradas.length} venta(s) encontrada(s).`,
          "success",
        );
      } catch (error) {
        console.error("❌ Error al filtrar ventas:", error);
        this.ventasFiltradas = [];
        this.mostrarMensaje(
          "❌ Error al buscar ventas en el servidor.",
          "error",
        );
      }
    },

    limpiarBusqueda() {
      this.busqueda = "";
      this.tipoBusqueda = "";
      this.fechaRango = { fechaInicio: "", fechaFin: "" };
      this.ventasFiltradas = [...this.ventas];
      // Re-aplicar filtro de usuario si está activo
      if (this.filtrarPorMiUsuario) this.aplicarFiltroUsuario();
    },

    // 🔹 Filtrar por el usuario logueado (solo ADMIN)
    aplicarFiltroUsuario() {
      if (this.filtrarPorMiUsuario) {
        const session = getSession();
        if (session?.user?.identificacion) {
          const miId = Number(session.user.identificacion);
          this.ventasFiltradas = this.ventasFiltradas.filter(
            (v) => Number(v.identificacionVendedor) === miId,
          );
        }
      } else {
        // Desmarcar: volver a mostrar todas (re-aplicar filtro actual si hay)
        if (this.tipoBusqueda) {
          this.filtrarVentas();
        } else {
          this.ventasFiltradas = [...this.ventas];
        }
      }
    },

    // 🔹 Callback del DateRangePicker
    onFechaRangoAplicar(rango) {
      this.fechaRango = rango;
      // Auto-buscar al aplicar el rango
      this.filtrarVentasPorFecha();
    },

    // 🔹 Metodo para filtrar ventas por rango de fecha de creacion
    async filtrarVentasPorFecha() {
      try {
        const inicio = this.fechaRango.fechaInicio;
        const fin = this.fechaRango.fechaFin;

        if (!inicio || !fin) {
          this.mostrarMensaje("⚠️ Seleccione un rango de fechas.", "error");
          return;
        }

        const response = await buscarOrdenesPorFechaCreacion(inicio, fin);

        // Manejar respuesta vacia (204 No Content o data vacio)
        if (
          !response.data ||
          (Array.isArray(response.data) && response.data.length === 0) ||
          response.status === 204
        ) {
          this.ventasFiltradas = [];
          this.mostrarMensaje(
            "❌ No se encontraron ventas en el rango de fechas seleccionado.",
            "warning",
          );
          return;
        }

        const ordenes = Array.isArray(response.data)
          ? response.data
          : [response.data];
        let ventasMapeadas = ordenes.map((o) => ({
          cliente: o.nombreCliente,
          identificacionCliente: o.identificacionCliente,
          productos: (o.detalles || []).map((d) => ({
            producto: d.producto,
            cantidad: d.cantidad,
            precio: d.precio,
          })),
          vendedor: o.nombreEmpleado,
          identificacionVendedor: o.identificacionEmpleado,
          total:
            this.calcularTotalDetalles(o.detalles || []) -
            (o.descuentoAplicado || 0),
          descuentoAplicado: o.descuentoAplicado || 0,
          descuentoTipo: o.descuentoTipo || null,
          descuentoValor: o.descuentoValor || 0,
          estado: o.estadoOrden || "CERRADA",
          comentario: o.comentario || "",
          valorRecibido: o.valorRecibido || 0,
          numeroFactura: o.numeroFactura,
          fecha: o.fechaCreacion,
        }));

        // 🔹 Si es USER/CAJERO, filtrar solo sus ventas
        const session = getSession();
        const roleName = (session?.user?.roleName || "").toUpperCase().trim();
        const rolesUsuario = ["USER", "USUARIO", "CAJERO"];
        if (rolesUsuario.includes(roleName) && session?.user?.identificacion) {
          const miId = Number(session.user.identificacion);
          ventasMapeadas = ventasMapeadas.filter(
            (o) => Number(o.identificacionVendedor) === miId,
          );
        }

        // 🔹 Si es ADMIN con check "Ver solo mis ventas" activo
        if (this.filtrarPorMiUsuario && session?.user?.identificacion) {
          const miId = Number(session.user.identificacion);
          ventasMapeadas = ventasMapeadas.filter(
            (o) => Number(o.identificacionVendedor) === miId,
          );
        }

        this.ventasFiltradas = ventasMapeadas;
        this.mostrarMensaje(
          "✅ " +
            this.ventasFiltradas.length +
            " venta(s) encontrada(s) en el rango de fechas.",
          "success",
        );
      } catch (error) {
        console.error("❌ Error al filtrar ventas por fecha:", error);
        this.mostrarMensaje(
          error.message || "Error al filtrar ventas por fecha",
          "error",
        );
      }
    },

    // 🔹 Método para manejar formato de precios
    formatPrecioCOP(valor) {
      if (valor === null || valor === undefined) return "$0";

      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(valor);
    },

    // 🔹 Método para subtotal por producto
    subtotalProducto(prod) {
      return Number(prod.precio) * Number(prod.cantidad);
    },

    // 🔹 Método para total por venta (por orden)
    totalVenta(venta) {
      // Usar el total pre-calculado (ya incluye descuento)
      if (venta.total !== undefined && venta.total !== null) {
        return venta.total;
      }
      return (venta.productos || []).reduce(
        (sum, p) => sum + p.precio * p.cantidad,
        0,
      );
    },

    // 🔹 Calcula el total de una orden a partir de sus detalles
    calcularTotalDetalles(detalles = []) {
      return detalles.reduce(
        (sum, d) => sum + Number(d.precio) * Number(d.cantidad),
        0,
      );
    },

    imprimirHistorial() {
      const ventas = this.ventasFiltradas;
      if (!ventas || ventas.length === 0) {
        this.mostrarMensaje("⚠️ No hay ventas para imprimir.", "warning");
        return;
      }

      let filas = "";
      ventas.forEach((v, idx) => {
        const productos = (v.productos || [])
          .map((p) => p.producto + " (x" + p.cantidad + ")")
          .join("<br>");
        const precios = (v.productos || [])
          .map((p) => this.formatPrecioCOP(p.precio))
          .join("<br>");
        const subtotales = (v.productos || [])
          .map((p) => this.formatPrecioCOP(p.precio * p.cantidad))
          .join("<br>");
        const total = this.totalVenta(v);

        // 🔹 Descuento formateado
        let descuentoTexto = "-";
        if (v.descuentoAplicado > 0) {
          descuentoTexto =
            (v.descuentoTipo === "PORCENTAJE" ? v.descuentoValor + "% " : "") +
            "-" +
            this.formatPrecioCOP(v.descuentoAplicado);
        }

        filas +=
          "<tr>" +
          "<td>" +
          (idx + 1) +
          "</td>" +
          "<td>" +
          (v.cliente || "") +
          "</td>" +
          "<td>" +
          (v.identificacionCliente || "") +
          "</td>" +
          "<td>" +
          productos +
          "</td>" +
          "<td>" +
          precios +
          "</td>" +
          "<td>" +
          subtotales +
          "</td>" +
          "<td>" +
          descuentoTexto +
          "</td>" +
          "<td><strong>" +
          this.formatPrecioCOP(total) +
          "</strong></td>" +
          "<td>" +
          (v.estado === "PENDIENTE"
            ? this.formatPrecioCOP(v.valorRecibido || 0)
            : "-") +
          "</td>" +
          "<td>" +
          (v.estado || "") +
          "</td>" +
          "<td>" +
          (v.comentario || "-") +
          "</td>" +
          "<td>" +
          (v.vendedor || "") +
          "</td>" +
          "<td>" +
          (v.identificacionVendedor || "") +
          "</td>" +
          "<td>" +
          (v.numeroFactura || "") +
          "</td>" +
          "<td>" +
          (v.fecha || "") +
          "</td>" +
          "</tr>";
      });

      const totalGeneral = ventas
        .filter((v) => v.estado === "CERRADA")
        .reduce((acc, v) => acc + this.totalVenta(v), 0);

      const html =
        "<!DOCTYPE html><html><head><title>Historial de Ventas</title>" +
        "<style>" +
        "body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }" +
        "h1 { text-align: center; font-size: 18px; margin-bottom: 15px; }" +
        "table { width: 100%; border-collapse: collapse; }" +
        "th, td { border: 1px solid #333; padding: 5px 4px; text-align: center; vertical-align: top; }" +
        "th { background: #333; color: white; font-size: 10px; }" +
        "td { font-size: 10px; }" +
        ".footer { text-align: right; margin-top: 20px; font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }" +
        "@page { size: landscape; margin: 10mm; }" +
        "</style></head><body>" +
        "<h1>Historial de Ventas</h1>" +
        "<table><thead><tr>" +
        "<th>#</th><th>CLIENTE</th><th>ID. CLIENTE</th><th>PRODUCTOS</th><th>P. UNITARIO</th><th>SUBTOTAL</th><th>DESCUENTO</th><th>TOTAL</th><th>ABONADO</th><th>ESTADO</th><th>COMENTARIO</th><th>VENDEDOR</th><th>ID. VENDEDOR</th><th>NRO. FACTURA</th><th>FECHA</th>" +
        "</tr></thead><tbody>" +
        filas +
        "</tbody></table>" +
        '<div class="footer">Total de Ventas: ' +
        this.formatPrecioCOP(totalGeneral) +
        "</div>" +
        "</body></html>";

      const ventana = window.open("", "_blank");
      ventana.document.write(html);
      ventana.document.close();
      ventana.onload = function () {
        ventana.print();
      };
    },
  },
};
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

.ventas-container.expanded {
  left: 220px;
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: -10px; /* espacio desde arriba */
}

.buscar-label {
  display: block; /* para que respete el margen como línea */
  margin-top: -20px; /* sube el texto hacia arriba */
  font-weight: bold;
}

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
}
.mensaje.success {
  background: #2ecc71;
  color: white;
}
.mensaje.error {
  background: #e74c3c;
  color: white;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.form-filtro {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-top: 20px;
  margin-bottom: 12px;
}
input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.buscar-btn,
.imprimir-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 12px;
}
.buscar-btn {
  background: #06d6a0;
  color: white;
  margin-left: 4px;
}
.buscar-btn:hover {
  background: #049670;
}
.buscar-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.imprimir-btn {
  background: #0077b6;
  color: white;
  margin-left: 10px;
}
.imprimir-btn:hover {
  background: #005f8a;
}

.ventas-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}
.ventas-table th,
.ventas-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}
.ventas-table ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ventas-table li {
  text-align: left;
}
.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

/* 🔹 Footer fijo al final */
.footer-ventas {
  margin-top: auto;
  padding-top: 20px;
  border-top: 2px solid #ccc;
  text-align: right;
}
.total {
  font-size: 1.2rem;
  font-weight: bold;
}

@media print {
  .no-print {
    display: none !important;
  }

  .historial-ventas-wrapper {
    display: block !important;
  }

  .ventas-container {
    position: static !important;
    left: auto !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    padding: 10px !important;
    margin: 0 !important;
    background: white !important;
    display: block !important;
    overflow: visible !important;
  }

  .ventas-container.expanded {
    left: auto !important;
  }

  .titulo {
    text-align: center !important;
    margin-bottom: 20px !important;
    font-size: 18px !important;
  }

  .ventas-table {
    width: 100% !important;
    table-layout: auto !important;
    font-size: 10px !important;
    border-collapse: collapse !important;
    word-break: break-word !important;
    page-break-inside: auto !important;
  }

  .ventas-table th,
  .ventas-table td {
    border: 1px solid #000 !important;
    padding: 4px 3px !important;
    text-align: center !important;
    background: white !important;
    white-space: normal !important;
  }

  .ventas-table th {
    background: #333 !important;
    color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .footer-ventas {
    text-align: right !important;
    margin-top: 20px !important;
    padding: 10px 0 !important;
    border-top: 2px solid #000 !important;
    position: static !important;
    width: 100% !important;
    font-size: 14px !important;
  }
}
</style>
