<!-- src/components/ventas/NuevaVentaView.vue -->

<template>
  <div class="nueva-venta-wrapper">
    <!-- Menú lateral (oculto en impresión) -->
    <DashboardSideMenu class="no-print" @menu-toggle="handleMenuToggle" />

    <!-- Contenido principal -->
    <div :class="['venta-container', { expanded: menuOpen }]">
      <!-- Encabezado -->
      <h1 class="titulo">Nueva Venta</h1>

      <!-- 🔔 Mensaje visual -->
      <transition name="fade">
        <div v-if="mensaje" :class="['mensaje', mensajeTipo, 'no-print']">
          {{ mensaje }}
        </div>
      </transition>

      <!-- 🗑️ Modal confirmación eliminar orden -->
      <transition name="fade">
        <div v-if="modalEliminarOrden.visible" class="modal-overlay">
          <div class="modal-content">
            <p>
              ⚠️ ¿Está seguro de eliminar la orden del cliente
              <strong>{{ modalEliminarOrden.cliente.nombres }}</strong>?
              <br />
              <small>Los productos serán devueltos al inventario.</small>
            </p>

            <div class="modal-buttons">
              <!-- ✅ Sí -->
              <button class="btn-yes"
                      @click="confirmarEliminarOrden">
                Sí
              </button>

              <!-- ❌ No -->
              <button class="btn-no"
                      @click="modalEliminarOrden.visible = false">
                No
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ✅ Modal confirmación cerrar venta con pagos mixtos -->
      <transition name="fade">
        <div v-if="modalCerrarVenta" class="modal-overlay">
          <div class="modal-content" style="min-width: 420px; max-width: 520px;">
            <h3 style="margin-bottom: 10px; text-align: center;">✅ Cerrar Venta — Pagos Mixtos</h3>

            <div style="margin: 10px 0; text-align: left; font-size: 14px;">
              <p><strong>Cliente:</strong> {{ cliente.nombres || 'CONSUMIDOR FINAL' }}</p>
              <p><strong>Total a Pagar:</strong> {{ formatPrecioCOP(calcularTotalFinal) }}</p>
              <p v-if="descuentoAplicado > 0"><strong>Descuento:</strong> -{{ formatPrecioCOP(descuentoAplicado) }}</p>
            </div>

            <!-- 🔹 Métodos de pago -->
            <div style="margin: 12px 0; border-top: 1px solid #ddd; padding-top: 10px;">
              <p style="font-weight: bold; margin-bottom: 8px;">💳 Métodos de Pago:</p>

              <div style="display: flex; flex-direction: column; gap: 8px;">
                <!-- Efectivo -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="width: 140px; font-size: 13px;">💵 Efectivo:</label>
                  <input v-model.number="pagosMixtos.efectivo" type="number" min="0" placeholder="0" style="flex:1; padding:5px; border-radius:4px; border:1px solid #ccc;" />
                </div>

                <!-- Tarjeta Débito -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="width: 140px; font-size: 13px;">💳 Tarjeta Débito:</label>
                  <input v-model.number="pagosMixtos.tarjetaDebito" type="number" min="0" placeholder="0" style="flex:1; padding:5px; border-radius:4px; border:1px solid #ccc;" />
                </div>

                <!-- Tarjeta Crédito -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="width: 140px; font-size: 13px;">💳 Tarjeta Crédito:</label>
                  <input v-model.number="pagosMixtos.tarjetaCredito" type="number" min="0" placeholder="0" style="flex:1; padding:5px; border-radius:4px; border:1px solid #ccc;" />
                </div>

                <!-- Transferencia / Nequi -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="width: 140px; font-size: 13px;">📱 Transferencia/Nequi:</label>
                  <input v-model.number="pagosMixtos.transferencia" type="number" min="0" placeholder="0" style="flex:1; padding:5px; border-radius:4px; border:1px solid #ccc;" />
                </div>

                <!-- Referencia (opcional) -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="width: 140px; font-size: 13px;">📋 Referencia:</label>
                  <input v-model="pagosMixtos.referencia" type="text" placeholder="Num. aprobación (opcional)" style="flex:1; padding:5px; border-radius:4px; border:1px solid #ccc;" />
                </div>
              </div>

              <!-- Resumen -->
              <div style="margin-top: 12px; padding: 8px; background: #f0f8ff; border-radius: 6px; font-size: 13px;">
                <p><strong>Total recibido:</strong> {{ formatPrecioCOP(totalPagosMixtos) }}</p>
                <p><strong>Faltante:</strong> {{ totalPagosMixtos >= calcularTotalFinal ? formatPrecioCOP(0) : formatPrecioCOP(calcularTotalFinal - totalPagosMixtos) }}</p>
                <p><strong>Cambio (efectivo):</strong> {{ formatPrecioCOP(Math.max(totalPagosMixtos - calcularTotalFinal, 0)) }}</p>
              </div>

              <!-- ⚠️ Advertencia pago insuficiente -->
              <div v-if="totalPagosMixtos > 0 && totalPagosMixtos < calcularTotalFinal" style="margin-top: 8px; padding: 8px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 12px; color: #856404;">
                ⚠️ <strong>Pago insuficiente.</strong> Faltan {{ formatPrecioCOP(calcularTotalFinal - totalPagosMixtos) }}. Puede cerrar la venta con un comentario explicando la deuda.
              </div>

              <!-- 📝 Comentario / Observación — solo habilitado si pago insuficiente -->
              <div style="margin-top: 12px;">
                <label style="font-size: 13px; font-weight: bold;">📝 Comentario (requerido si pago insuficiente):</label>
                <textarea
                    v-model="pagosMixtos.comentario"
                    rows="2"
                    :disabled="totalPagosMixtos >= calcularTotalFinal"
                    :placeholder="totalPagosMixtos < calcularTotalFinal ? 'Ej: Debe ' + formatPrecioCOP(calcularTotalFinal - totalPagosMixtos) + ', paga el viernes' : 'Sin observaciones (pago completo)'"
                    style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; resize: vertical; margin-top: 4px;"
                ></textarea>
              </div>
            </div>

            <div class="modal-buttons" style="margin-top: 15px;">
              <button class="btn-yes" style="background: #28a745;"
                      @click="validarAntesDeConfirmar"
                      :disabled="totalPagosMixtos <= 0">
                Sí, cerrar
              </button>
              <button class="btn-no"
                      @click="modalCerrarVenta = false">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 🔹 Modal alerta: comentario requerido para pago insuficiente -->
      <transition name="fade">
        <div v-if="modalAlertaComentario" class="modal-overlay" style="z-index: 10002;">
          <div class="modal-content" style="max-width: 400px; text-align: center;">
            <p style="font-size: 16px; margin-bottom: 12px;">⚠️ <strong>Valor insuficiente</strong></p>
            <p style="font-size: 13px; color: #555;">
              El pago ingresado es menor al total a pagar.<br>
              Debe agregar un <strong>comentario</strong> para el historial de la deuda.
            </p>
            <div class="modal-buttons" style="margin-top: 15px;">
              <button class="btn-no" @click="modalAlertaComentario = false">
                Entendido
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- 🔹 Sub-modal de confirmación final -->
      <transition name="fade">
        <div v-if="modalConfirmacionFinal" class="modal-overlay" style="z-index: 10001;">
          <div class="modal-content" style="max-width: 420px;">
            <!-- Caso: pago insuficiente con comentario -->
            <div v-if="pagoInsuficiente" style="text-align: center;">
              <p style="font-size: 16px; margin-bottom: 10px;">⚠️ <strong>Pago insuficiente</strong></p>
              <p style="font-size: 13px; color: #555;">
                El valor recibido ({{ formatPrecioCOP(totalPagosMixtos) }}) es menor al total a pagar ({{ formatPrecioCOP(calcularTotalFinal) }}).
              </p>
              <p style="font-size: 13px; color: #555; margin-top: 6px;">
                <strong>Faltante:</strong> {{ formatPrecioCOP(calcularTotalFinal - totalPagosMixtos) }}
              </p>
              <p style="font-size: 12px; margin-top: 10px; padding: 8px; background: #fff3cd; border-radius: 6px; color: #856404;">
                📝 Comentario: "{{ pagosMixtos.comentario }}"
              </p>
              <p style="font-size: 13px; margin-top: 12px; font-weight: bold;">
                ¿Está seguro de cerrar la orden con pago insuficiente?
              </p>
            </div>

            <!-- Caso: pago suficiente -->
            <div v-else style="text-align: center;">
              <p style="font-size: 16px; margin-bottom: 10px;">✅ <strong>Confirmar cierre de venta</strong></p>
              <p style="font-size: 13px; color: #555;">
                Total a pagar: <strong>{{ formatPrecioCOP(calcularTotalFinal) }}</strong>
              </p>
              <p style="font-size: 13px; color: #555;">
                Recibido: <strong>{{ formatPrecioCOP(totalPagosMixtos) }}</strong>
              </p>
              <p style="font-size: 13px; color: #555;" v-if="totalPagosMixtos > calcularTotalFinal">
                Cambio: <strong>{{ formatPrecioCOP(totalPagosMixtos - calcularTotalFinal) }}</strong>
              </p>
              <p style="font-size: 13px; margin-top: 12px; font-weight: bold;">
                ¿Está seguro de cerrar esta venta?
              </p>
            </div>

            <div class="modal-buttons" style="margin-top: 15px;">
              <button class="btn-yes" style="background: #28a745;" @click="confirmarCerrarVenta">
                Sí, confirmar
              </button>
              <button class="btn-no" @click="modalConfirmacionFinal = false">
                No, volver
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Formulario principal (oculto en impresión) -->
      <div class="form-container no-print">
        <div class="form-row">
          <label>Código</label>
          <input v-model="venta.codigo" type="text" @keyup.enter="buscarProducto" :disabled="ordenEstado === 'CERRADA'" />

          <label>Producto</label>
          <input v-model="venta.producto" type="text" @keyup.enter="buscarProducto" :disabled="ordenEstado === 'CERRADA'" />

          <label>Descripción</label>
          <input v-model="venta.descripcion" type="text" @keyup.enter="buscarProducto" :disabled="ordenEstado === 'CERRADA'" />

          <label>Cantidad</label>
          <input v-model.number="venta.cantidad" type="number" min="1" @keyup.enter="buscarProducto" :disabled="ordenEstado === 'CERRADA'" />

          <label>Precio</label>
          <input
              :value="precioEditando ? venta.precio : formatPrecioInput(venta.precio)"
              :type="precioEditando ? 'number' : 'text'"
              min="1"
              step="0.01"
              @focus="precioEditando = true"
              @blur="precioEditando = false"
              @input="venta.precio = Number($event.target.value)"
              @keyup.enter="buscarProducto"
              :disabled="ordenEstado === 'CERRADA'"
          />

          <!-- ➕ Botón para agregar producto -->
          <button type="button"
                  class="agregar-btn"
                  @click="agregarItem"
                  :disabled="!formValido || ordenCerrada">
            ➕ Agregar Producto
          </button>

          <!-- 🧹 Botón de limpiar campos -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatos()"
                  @click="limpiarCampos">
            🧹 Limpiar campos
          </button>
        </div>

        <div class="form-row">
          <label class="stock">Existencias disponibles</label>
          <input v-model="venta.stock" type="number" disabled />

          <!-- ➕ Botón de nueva venta -->
          <button type="button"
                  class="agregar-btn"
                  @click="agregarCliente"
                  :disabled="!tieneDatos">
            ➕ Nueva Venta
          </button>
        </div>

        <!-- 🔹 Filtro de órdenes por estado con botón al lado -->
        <div class="form-row" style="display: flex; align-items: center; gap: 8px;">
          <label for="filtroEstado">Filtrar Órdenes</label>

          <!-- Select de estados -->
          <select
              v-model="filtroEstado"
              id="filtroEstado">
            <option disabled value="">Seleccione un estado</option>
            <option value="ABIERTA">ABIERTA</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="CERRADA">CERRADA</option>
          </select>

          <!-- 🔍 Botón de búsqueda, deshabilitado si no hay estado seleccionado -->
          <button type="button"
                  class="buscar-btn"
                  @click="cargarOrdenesFiltradas"
                  :disabled="!filtroEstado">
            🔍 Buscar
          </button>

          <!-- 🧹 Botón de limpiar filtro -->
          <button type="button"
                  class="limpiar-campos-btn"
                  @click="limpiarFiltro"
                  :disabled="!filtroEstado">
            🧹 Limpiar filtro
          </button>

          <!-- 🔹 Checkbox: Ver solo mis ventas (solo ADMIN) -->
          <label v-if="isAdmin" style="display: flex; align-items: center; gap: 4px; margin-left: 8px; font-size: 13px; cursor: pointer;">
            <input type="checkbox" v-model="filtrarPorMiUsuario" @change="cargarOrdenesFiltradas" />
            Ver solo mis ventas
          </label>
        </div>

        <!-- select de órdenes abiertas -->
        <div v-if="ordenesFiltradas.length > 0" class="form-row">
          <label for="ordenSeleccionada">Seleccione Orden</label>
          <select v-model="ordenSeleccionada" id="ordenSeleccionada" @change="cargarItemsOrdenSeleccionada">
            <option disabled value="">Seleccione una orden</option>
            <option v-for="orden in ordenesFiltradas" :key="orden.numeroOrden" :value="orden.numeroOrden">
              {{ orden.nombreCliente || 'CONSUMIDOR FINAL' }} | {{ orden.estadoOrden }} | Total: {{ formatPrecioCOP(totalOrden(orden)) }}{{ orden.estadoOrden === 'PENDIENTE' && orden.comentario ? ' | 📝 ' + orden.comentario : '' }}
            </option>
          </select>

          <!-- Check de órdenes por cliente o general -->
          <div class="filtro-opciones">
            <label>
              <input type="checkbox" v-model="filtrarPorCliente" />
              Ver solo órdenes del cliente actual
            </label>
          </div>
        </div>
      </div>

      <!-- tabla de productos solo de la orden seleccionada -->
      <table class="productos-table">
        <thead>
        <tr>
          <th>CÓDIGO</th>
          <th>PRODUCTO</th>
          <th>DESCRIPCIÓN</th>
          <th>CANTIDAD</th>
          <th>PRECIO U.</th>
          <th>FECHA CREACIÓN</th>
          <th class="no-print">FECHA ACTUALIZACIÓN</th>
          <th>PRECIO TOTAL</th>
          <th v-if="ordenEstado === 'PENDIENTE'">PAGADO</th>
          <th v-if="ordenEstado === 'PENDIENTE'">RESTANTE</th>
          <th v-if="ordenEstado === 'PENDIENTE'">COMENTARIO</th>
        </tr>
        </thead>

        <tbody>
        <!-- 🔹 Productos agregados -->
        <tr v-for="(item, idx) in items" :key="'item-' + idx">
          <td>{{ item.codigo }}</td>
          <td>{{ item.producto }}</td>
          <td>{{ item.descripcion }}</td>

          <td class="cantidad-cell">
            <span>{{ item.cantidad }}</span>
            <!-- Cuadrito para ingresar cantidad a eliminar y botón al lado -->
            <div class="mini-controls no-print" v-if="ordenEstado === 'ABIERTA'">
              <input v-model.number="item.removeQty"
                     type="number"
                     min="0"
                     class="mini-input"
                     placeholder="Cant" />
              <!-- ❌️ Botón de no -->
              <button class="delete-btn"
                      @click="eliminarItem(idx)"
                      title="Eliminar / Restar">
                🗑️
              </button>
            </div>
          </td>

          <td>{{ formatPrecioCOP(item.precio) }}</td>
          <td>{{ item.fechaCreacion }}</td>
          <td class="no-print">{{ item.fechaActualizacion }}</td>
          <td class="precio-total-cell">
            {{ formatPrecioCOP(item.cantidad * item.precio) }}
          </td>
          <!-- Columnas PENDIENTE: solo en la primera fila -->
          <td v-if="ordenEstado === 'PENDIENTE' && idx === 0" :rowspan="items.length" style="vertical-align: middle; font-weight: bold; color: #27ae60;">
            {{ formatPrecioCOP(valorPagado) }}
          </td>
          <td v-if="ordenEstado === 'PENDIENTE' && idx === 0" :rowspan="items.length" style="vertical-align: middle; font-weight: bold; color: #c0392b;">
            {{ formatPrecioCOP(calcularTotalFinal - valorPagado) }}
          </td>
          <td v-if="ordenEstado === 'PENDIENTE' && idx === 0" :rowspan="items.length" style="vertical-align: middle; font-size: 11px;">
            {{ ordenComentario || '-' }}
          </td>
        </tr>

        <tr v-if="items.length === 0">
          <td :colspan="ordenEstado === 'PENDIENTE' ? 11 : 8" class="empty-row">No hay productos agregados ni órdenes filtradas.</td>
        </tr>
        </tbody>
      </table>

      <!-- === Sección final (datos cliente + acciones) === -->
      <div class="footer-venta">
        <!-- Datos de cliente -->
        <div class="form-row cliente-datos no-print">
          <label>Identificación Cliente</label>
          <input v-model="cliente.identificacion" type="text" :disabled="ordenEstado === 'CERRADA'" @keyup.enter="buscarClientePorIdentificacionHandler" />

          <label>Nombre Cliente</label>
          <input v-model="cliente.nombres" type="text" :disabled="ordenEstado === 'CERRADA'" @keyup.enter="buscarClientePorNombreHandler" />

          <label>Identificación Empleado</label>
          <input v-model="empleado.identificacion" type="text" disabled />

          <label>Nombre Empleado</label>
          <input v-model="empleado.nombres" type="text" disabled />
        </div>

        <!-- Acciones normales -->
        <div class="acciones-footer no-print">
          <!-- ✅ Ahora el botón también valida identificación y nombre -->
          <!-- 🖨️ Botón de imprimir -->
          <button @click="imprimirFactura"
                  :disabled="!puedeImprimir">
            🖨️ Imprimir
          </button>

          <button type="button"
                  class="delete-btn"
                  title="Eliminar orden"
                  :disabled="!numeroOrden || ordenEstado === 'CERRADA'"
                  @click="abrirModalEliminarOrden">
            🗑️ Eliminar Orden
          </button>

          <!-- 🧹 Botón de limpiar -->
          <button type="button"
                  class="limpiar-campos-btn"
                  :disabled="!hayDatosCliente() || ordenCerrada"
                  @click="limpiarCamposCliente">
            🧹 Limpiar Cliente
          </button>

          <!-- ✅ Botón de cerrar venta -->
          <button type="button"
                  class="cerrar-venta-btn"
                  @click="abrirModalCerrarVenta"
                  :disabled="ordenCerrada || items.length === 0">
            ✅ Cerrar Venta
          </button>

          <!-- 💵 Botón de recibido del cliente -->
          <div class="pago-container">
            <label>💵 Recibido </label>
            <div class="pago-input-row">
              <input
                  v-model.number="valorPagado"
                  type="number"
                  min="0"
                  placeholder="Ingrese valor recibido"
                  :disabled="ordenCerrada || ordenEstado !== 'ABIERTA' || items.length === 0"
              />
              <button type="button" class="btn-valores-rapidos" :disabled="ordenCerrada || ordenEstado !== 'ABIERTA' || items.length === 0" @click.stop="mostrarValoresRapidos = !mostrarValoresRapidos" title="Valores rapidos">💲</button>
            </div>
            <!-- Grilla de valores rapidos -->
            <div v-if="mostrarValoresRapidos && !ordenCerrada" class="valores-rapidos" @click.stop>
              <button v-for="v in valoresRapidos" :key="v" @click="seleccionarValorRapido(v)">
                {{ formatPrecioInput(v) }}
              </button>
            </div>
          </div>

          <div class="total">
            <div>💰 Subtotal: {{ formatPrecioCOP(calcularSubtotal) }}</div>
            <div>💵 IVA (19%): {{ formatPrecioCOP(calcularIVA) }}</div>
            <div v-if="descuentoAplicado > 0" class="descuento-linea">
              🏷️ Descuento ({{ descuentoTipo === 'porcentaje' ? descuentoValor + '%' : formatPrecioCOP(descuentoValor) }}): -{{ formatPrecioCOP(descuentoAplicado) }}
            </div>
            <div><strong>💰 Total a Pagar: {{ formatPrecioCOP(calcularTotalFinal) }}</strong></div>
            <div>💰 Cambio: {{ formatPrecioCOP(Math.max(valorPagado - calcularTotalFinal, 0)) }}</div>
            <button
                type="button"
                class="btn-descuento"
                :disabled="items.length === 0 || ordenCerrada"
                @click="mostrarModalDescuento = true">
              🏷️ {{ descuentoAplicado > 0 ? 'Editar Descuento' : 'Descuento' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de descuento -->
    <div v-if="mostrarModalDescuento" class="modal-overlay-descuento">
      <div class="modal-descuento">
        <h3>🏷️ Aplicar Descuento</h3>

        <div class="desc-tipo">
          <label>
            <input type="radio" v-model="descuentoTipo" value="porcentaje" /> Porcentaje (%)
          </label>
          <label>
            <input type="radio" v-model="descuentoTipo" value="fijo" /> Valor fijo ($)
          </label>
        </div>

        <div class="desc-input">
          <input
              v-model.number="descuentoValor"
              type="number"
              min="0"
              :placeholder="descuentoTipo === 'porcentaje' ? 'Ej: 10' : 'Ej: 5000'"
          />
          <span class="desc-sufijo">{{ descuentoTipo === 'porcentaje' ? '%' : '$' }}</span>
        </div>

        <div class="desc-preview" v-if="descuentoValor > 0">
          <p>Subtotal: {{ formatPrecioCOP(calcularSubtotal) }}</p>
          <p>Descuento: -{{ formatPrecioCOP(previewDescuento) }}</p>
          <p><strong>Total con descuento: {{ formatPrecioCOP(calcularSubtotal - previewDescuento) }}</strong></p>
        </div>

        <div class="desc-botones">
          <button class="btn-aplicar-desc" @click="aplicarDescuento" :disabled="!descuentoValor || descuentoValor <= 0">Aplicar</button>
          <button v-if="descuentoAplicado > 0" class="btn-quitar-desc" @click="quitarDescuento">Quitar Descuento</button>
          <button class="btn-cancelar-desc" @click="mostrarModalDescuento = false">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- 🧾 Ticket SOLO para impresión -->
    <div id="ticket-print">
      <TicketFactura
          :empresa="empresa"
          :factura="ticketData.factura || facturaTicket"
          :recibido="ticketData.recibido || valorPagado"
          :descuento="ticketData.descuento || descuentoAplicado"
          :descuentoInfo="ticketData.descuentoInfo || (descuentoAplicado > 0 ? (descuentoTipo === 'porcentaje' ? '(' + descuentoValor + '%)' : '') : '')"
      />
    </div>
  </div>
</template>


<script>
import DashboardSideMenu from '@/views/dashboard/DashboardSideMenu.vue'
import TicketFactura from '@/components/ticket/TicketFactura.vue'
import {
  buscarProductoPorCodigo,
  buscarProductoPorNombre,
  buscarProductoPorDescripcion,
  buscarProductoPorCantidad,
  buscarProductoPorPrecio,
  restarStockProducto
} from '@/services/apiProductsService.js'
import {
  agregarProducto,
  restarCantidadProducto,
  // cerrarOrdenPorCliente, // Reemplazado por cerrarOrdenConPagosMixtos (v2)
  cerrarOrdenConPagosMixtos,
  listarOrdenesPorEstado,
  listarOrdenesPorClienteYEstado,
  eliminarOrdenCliente
} from '@/services/apiOrdersService.js'
import { buscarClientePorIdentificacion, buscarClientePorNombres } from '@/services/apiCustomerService.js'
import { buscarUsuarioPorIdentificacion, buscarUsuarioPorNombres } from '@/services/apiUsuariosService.js'
import { obtenerPrimeraEmpresa } from '@/services/apiConfigEmpresaService'
import { getSession } from '@/services/apiAuthService'

export default {
  name: 'NuevaVentaView',
  components: {
    DashboardSideMenu,
    TicketFactura
  },

  data() {
    return {
      menuOpen: localStorage.getItem('menuPinned') === 'true', // Siempre arranca expandido y false arranca oculto
      precioEditando: false,
      mostrarModalDescuento: false,
      mostrarValoresRapidos: false,
      descuentoTipo: 'porcentaje',
      descuentoValor: 0,
      descuentoAplicado: 0,
      venta: {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: null,
        precio: null,
        stock: 0
      },
      cliente: {
        identificacion: '',
        nombres: '',
        apellidos: ''
      },
      empleado: {
        identificacion: '',
        nombres: '',
        apellidos: ''
      },
      producto: {
        proveedorId: null,
        proveedorName: ''
      },
      empresaData: {
        nombre: '',
        nit: '',
        direccion: '',
        telefono: ''
      },
      items: [],
      valorPagado: 0,
      numeroOrden: null, // 🔹 numeroOrden (UUID) de la orden actual
      numeroFactura: null,
      ordenEstado: 'ABIERTA', // 🔹 Estado de la orden (ABIERTA o CERRADA)
      // 🔔 mensajes en pantalla
      mensaje: '',
      mensajeTipo: '', // success | warning | error
      filtroEstado: '',
      filtrarPorCliente: false,
      filtrarPorMiUsuario: false,
      ordenesFiltradas: [],
      ordenSeleccionada: null, // Número de orden activa seleccionada
      ordenCargada: false, // Indica si se seleccionó una orden para mostrar detalles
      clienteEncontrado: false, // ✅ habilita los campos producto solo si cliente válido
      empleadoEncontrado: false,  // ✅ agregado para consistencia
      empleadosFiltrados: [],
      modalEliminarOrden: {
        visible: false,
        numeroOrden: null,
        cliente: {
          identificacion: null,
          nombres: '',
          apellidos: ''
        }
      },
      // ID del cliente almacenado en la orden actual (para cerrar/eliminar)
      ordenIdentificacionCliente: null,
      // Modal confirmacion cerrar venta
      modalCerrarVenta: false,
      // Modal segunda confirmación
      modalConfirmacionFinal: false,
      // Modal alerta comentario requerido
      modalAlertaComentario: false,
      // Comentario de la orden cargada
      ordenComentario: '',
      // 🔹 Pagos mixtos
      pagosMixtos: {
        efectivo: 0,
        tarjetaDebito: 0,
        tarjetaCredito: 0,
        transferencia: 0,
        referencia: '',
        comentario: ''
      },
      // 🔹 Snapshot de datos del ticket para imprimir después de cerrar
      ticketData: {
        factura: null,
        recibido: 0,
        descuento: 0,
        descuentoInfo: ''
      }
    }
  },

  computed: {
    tieneDatos() {
      return (
          (this.cliente.identificacion && this.cliente.identificacion !== null) ||
          (this.cliente.nombres && String(this.cliente.nombres).trim() !== "") ||
          (this.cliente.apellidos && String(this.cliente.apellidos).trim() !== "") ||
          (this.empleado.identificacion && String(this.empleado.identificacion).trim() !== "") ||
          (this.empleado.nombres && String(this.empleado.nombres).trim() !== "") ||
          (this.empleado.apellidos && String(this.empleado.apellidos).trim() !== "")
      )
    },

    ordenCerrada() {
      return this.ordenEstado === 'CERRADA'
    },

    calcularTotal() {
      return this.items.reduce((acc, i) => acc + (Number(i.precio) * Number(i.cantidad)), 0)
    },

    // ✅ Validación para habilitar botón "Agregar"
    formValido() {
      return (
          // this.venta.codigo?.trim() !== '' &&
          this.venta.codigo >= 1 &&
          this.venta.producto?.trim() !== '' &&
          this.venta.descripcion?.trim() !== '' &&
          this.venta.cantidad >= 1 &&
          this.venta.precio >= 1
      )
    },

    // ✅ Validación para habilitar botón "Imprimir"
    puedeImprimir() {
      return this.items.length > 0
    },

    facturaTicket() {
      const ahora = new Date()
      const dia = ahora.getDate()
      const mes = ahora.getMonth() + 1
      const anio = ahora.getFullYear()
      const hh = String(ahora.getHours()).padStart(2, '0')
      const mm = String(ahora.getMinutes()).padStart(2, '0')
      const ss = String(ahora.getSeconds()).padStart(2, '0')
      const fechaCorta = dia + '/' + mes + '/' + anio + ' ' + hh + ':' + mm + ':' + ss

      return {
        numero: this.numeroFactura || 'N/A',
        fecha: fechaCorta,

        clienteNombre: (this.cliente.nombres || 'CONSUMIDOR FINAL') + ' ' + (this.cliente.apellidos || ''),
        clienteCC: this.cliente.identificacion || '0',

        vendedorNombre: (this.empleado.nombres || 'CAJERO') + ' ' + (this.empleado.apellidos || ''),
        vendedorCC: this.empleado.identificacion || '0',

        productos: this.items.map(i => ({
          nombre: i.producto,
          descripcion: i.descripcion,
          cantidad: i.cantidad,
          precio: i.precio
        })),
        total: this.calcularSubtotal,
        totalFinal: this.calcularTotalFinal
      }
    },

    empresa() {
      return this.empresaData
    },

    calcularSubtotal() {
      // Total de la venta (precios ya incluyen IVA, como en supermercados colombianos)
      return this.items.reduce(
          (acc, i) => acc + (Number(i.precio) * Number(i.cantidad)),
          0
      )
    },

    calcularIVA() {
      // El IVA se extrae del precio (ya esta incluido): IVA = total - (total / 1.19)
      return Math.round(this.calcularSubtotal - (this.calcularSubtotal / 1.19))
    },

    calcularTotalFinal() {
      // El total a pagar es el subtotal menos el descuento aplicado
      return Math.max(this.calcularSubtotal - this.descuentoAplicado, 0)
    },

    previewDescuento() {
      if (!this.descuentoValor || this.descuentoValor <= 0) return 0
      if (this.descuentoTipo === 'porcentaje') {
        return Math.round(this.calcularSubtotal * this.descuentoValor / 100)
      }
      return this.descuentoValor
    },

    valoresRapidos() {
      // De 10.000 a 100.000 (de 10 en 10) + de 200.000 a 1.000.000 (de 100 en 100)
      const valores = []
      for (let i = 10000; i <= 100000; i += 10000) valores.push(i)
      for (let i = 200000; i <= 1000000; i += 100000) valores.push(i)
      return valores
    },

    // 🔹 Total de pagos mixtos
    totalPagosMixtos() {
      return (Number(this.pagosMixtos.efectivo) || 0) +
          (Number(this.pagosMixtos.tarjetaDebito) || 0) +
          (Number(this.pagosMixtos.tarjetaCredito) || 0) +
          (Number(this.pagosMixtos.transferencia) || 0)
    },

    // 🔹 Detecta si el pago es insuficiente
    pagoInsuficiente() {
      return this.totalPagosMixtos < this.calcularTotalFinal
    },

    // 🔹 Detecta si el usuario logueado es ADMIN
    isAdmin() {
      const session = getSession()
      const role = (session?.user?.roleName || '').toUpperCase().trim()
      return ['ADMIN', 'ADMINISTRADOR', 'SUPERADMIN'].includes(role)
    }
  },

  async mounted() {
    // 🔹 Cargar datos del empleado logueado desde la sesión
    this.cargarEmpleadoDesdeSession()

    // 🔹 Cargar todas las ordenes abiertas desde backend al iniciar
    this.filtroEstado = 'ABIERTA'
    this.cargarOrdenesFiltradas()

    // 🔹 Cargar empresa
    await this.cargarDatosEmpresa()

    // Cerrar grilla de valores rapidos al hacer clic fuera
    document.addEventListener('click', this.cerrarValoresRapidos)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.cerrarValoresRapidos)
  },

  methods: {
    handleMenuToggle(state) {
      this.menuOpen = state
    },

    // 🔹 Cargar datos del empleado logueado automáticamente desde la sesión
    cargarEmpleadoDesdeSession() {
      try {
        const session = getSession()
        if (session?.user) {
          this.empleado.identificacion = session.user.identificacion || ''
          this.empleado.nombres = session.user.nombres || session.user.login || ''
          this.empleado.apellidos = session.user.apellidos || ''
          this.empleadoEncontrado = !!(this.empleado.identificacion || this.empleado.nombres)
          console.log('👨‍💼 Empleado cargado desde sesión:', this.empleado.identificacion, this.empleado.nombres)
        }
      } catch (error) {
        console.error('⚠️ Error al cargar empleado desde sesión:', error)
      }
    },

    // 🔹 Método de mostrar mensaje
    mostrarMensaje(texto, tipo = 'success') {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => {
        this.mensaje = ''
      }, 3000)
    },

    // 🔹 Valores por defecto de empresa
    setEmpresaDefault() {
      this.empresaData = {
        nombre: 'MI NEGOCIO',
        nit: '',
        direccion: '',
        telefono: ''
      }
    },

    async cargarDatosEmpresa() {
      try {
        const response = await obtenerPrimeraEmpresa()

        if (response?.data?.length > 0) {
          const empresa = response.data[0]

          this.empresaData = {
            nombre: empresa.nombreEmpresa || 'MI NEGOCIO',
            nit: empresa.nit || '',
            direccion: empresa.direccion || '',
            telefono: empresa.telefono || ''
          }

        } else {
          this.setEmpresaDefault()
        }

      } catch (error) {
        console.error('❌ Error cargando empresa:', error)
        this.setEmpresaDefault()
      }
    },

    cargarItemsOrdenSeleccionada() {
      const orden = this.ordenesFiltradas.find(o => o.numeroOrden === this.ordenSeleccionada)

      if (orden) {
        this.setOrdenSeleccionada(orden)
      } else {
        this.items = []
        this.numeroOrden = null
        this.clienteEncontrado = false
        this.ordenCargada = false
      }
    },

    setOrdenSeleccionada(orden) {
      // Cargar items de la orden
      this.items = (orden.detalles || []).map(d => ({
        codigo: d.codigo,
        producto: d.producto,
        descripcion: d.descripcion,
        cantidad: d.cantidad,
        precio: d.precio,
        fechaCreacion: d.fechaCreacion,
        fechaActualizacion: d.fechaActualizacion,
        removeQty: null
      }))

      // 👤 Llenar datos del cliente
      this.cliente.identificacion = orden.identificacionCliente || ''
      this.cliente.nombres = orden.nombreCliente || ''
      this.cliente.apellidos = orden.apellidoCliente || ''
      this.clienteEncontrado = true

      // 👨‍💼 Empleado
      this.empleado.identificacion = orden.identificacionEmpleado || ''
      this.empleado.nombres = orden.nombreEmpleado || ''
      this.empleado.apellidos = orden.apellidoEmpleado || ''
      this.empleadoEncontrado = !!(
          orden.identificacionEmpleado || orden.nombreEmpleado
      )

      // Orden
      this.numeroOrden = orden.numeroOrden
      this.ordenEstado = orden.estadoOrden || 'ABIERTA'
      this.numeroFactura = orden.numeroFactura
      this.ordenCargada = true

      // Guardar el ID del cliente de la orden para cerrar/eliminar
      this.ordenIdentificacionCliente = orden.identificacionCliente ?? 0

      // 💵 Si la orden esta cerrada o pendiente, mostrar el valor recibido guardado en BD
      if (this.ordenEstado === 'CERRADA' || this.ordenEstado === 'PENDIENTE') {
        this.valorPagado = orden.valorRecibido || 0
      } else {
        this.valorPagado = 0
      }

      // 🔹 Cargar datos de descuento desde la orden (persistidos en BD)
      if (orden.descuentoAplicado && orden.descuentoAplicado > 0) {
        this.descuentoTipo = (orden.descuentoTipo || 'PORCENTAJE') === 'PORCENTAJE' ? 'porcentaje' : 'fijo'
        this.descuentoValor = orden.descuentoValor || 0
        this.descuentoAplicado = orden.descuentoAplicado || 0
      } else {
        this.descuentoTipo = 'porcentaje'
        this.descuentoValor = 0
        this.descuentoAplicado = 0
      }

      // 🔹 Cargar comentario de la orden
      this.ordenComentario = orden.comentario || ''
    },

    async cargarOrdenesFiltradas() {
      try {
        // Limpieza inicial
        this.ordenesFiltradas = []
        this.ordenSeleccionada = null
        this.items = []
        this.ordenCargada = false

        let response
        if (this.filtrarPorCliente && this.cliente.identificacion) {
          // 🔹 Escenario por cliente
          response = await listarOrdenesPorClienteYEstado(this.cliente.identificacion, this.filtroEstado)
        } else {
          // 🔹 Escenario global
          response = await listarOrdenesPorEstado(this.filtroEstado)
        }

        this.ordenesFiltradas = response.data || []

        // 🔹 Si es USER/CAJERO, filtrar solo sus órdenes
        const session = getSession()
        const roleName = (session?.user?.roleName || '').toUpperCase().trim()
        const rolesUsuario = ['USER', 'USUARIO', 'CAJERO']
        if (rolesUsuario.includes(roleName) && session?.user?.identificacion) {
          const miId = Number(session.user.identificacion)
          this.ordenesFiltradas = this.ordenesFiltradas.filter(o => Number(o.identificacionEmpleado) === miId)
        }

        // 🔹 Si es ADMIN y tiene el checkbox "Ver solo mis ventas" activo
        if (!rolesUsuario.includes(roleName) && this.filtrarPorMiUsuario && session?.user?.identificacion) {
          const miId = Number(session.user.identificacion)
          this.ordenesFiltradas = this.ordenesFiltradas.filter(o => Number(o.identificacionEmpleado) === miId)
        }

        this.mostrarMensaje(`✅ ${this.ordenesFiltradas.length} órdenes cargadas.`, 'success')

        if (this.ordenesFiltradas.length === 1) {
          // 👌 Si hay solo una orden, la cargamos directo
          this.ordenSeleccionada = this.ordenesFiltradas[0].numeroOrden
          this.cargarItemsOrdenSeleccionada()
        } else {
          // 👌 Si hay más de una, obligamos al usuario a elegir
          this.ordenSeleccionada = null
          this.items = []
          this.ordenCargada = false
        }

      } catch (error) {
        console.error('❌ Error al cargar órdenes filtradas:', error)
        this.mostrarMensaje('Error al obtener órdenes filtradas.', 'error')
        this.ordenesFiltradas = []
        this.ordenCargada = false
      }
    },

    // 🔹 Buscar cliente por identificación
    async buscarClientePorIdentificacionHandler() {
      if (!this.cliente.identificacion || this.cliente.identificacion === null) {
        this.mostrarMensaje('Ingrese una identificación del cliente.', 'error')
        return
      }
      try {
        const response = await buscarClientePorIdentificacion(Number(this.cliente.identificacion))
        const cliente = response.data
        if (cliente) {
          this.cliente.nombres = cliente.nombres || ''
          this.cliente.apellidos = cliente.apellidos || ''
          this.clienteEncontrado = true
          this.ordenEstado = 'ABIERTA'   // 👈 Reiniciamos estado al abrir nueva orden
          this.mostrarMensaje(`✅ Cliente encontrado: ${cliente.nombres}`, 'success')
        } else {
          this.clienteEncontrado = false
          this.mostrarMensaje('❌ Cliente no encontrado.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al buscar cliente por identificación:', error)
        this.mostrarMensaje('Error en búsqueda de cliente por identificación.', 'error')
        this.clienteEncontrado = false
      }
    },

    // 🔹 Buscar cliente por nombre
    async buscarClientePorNombreHandler() {
      if (!this.cliente.nombres || this.cliente.nombres.trim() === '') {
        this.mostrarMensaje('Ingrese un nombre de cliente.', 'error')
        return
      }
      try {
        const response = await buscarClientePorNombres(this.cliente.nombres)
        const clientes = response.data
        if (clientes && clientes.length > 0) {
          // Tomamos el primero por simplicidad
          const cliente = clientes[0]
          this.cliente.identificacion = cliente.identificacion || ''
          this.cliente.nombres = cliente.nombres || ''
          this.cliente.apellidos = cliente.apellidos || ''
          this.clienteEncontrado = true
          this.ordenEstado = 'ABIERTA'   // 👈 Reiniciamos estado al abrir nueva orden
          this.mostrarMensaje(`✅ Cliente encontrado: ${cliente.nombres}`, 'success')
        } else {
          this.clienteEncontrado = false
          this.mostrarMensaje('❌ No se encontraron clientes con ese nombre.', 'error')
        }
      } catch (error) {
        console.error('❌ Error al buscar cliente por nombre:', error)
        this.mostrarMensaje('Error en búsqueda de cliente por nombre.', 'error')
        this.clienteEncontrado = false
      }
    },

    // 🔹 Buscar Empleado por identificación
    async buscarEmpleadoPorIdentificacionHandler() {
      const texto = this.empleado.identificacion?.trim()

      if (!texto) {
        this.mostrarMensaje('Ingrese una identificación del empleado.', 'error')
        return
      }

      try {
        // Llamada al servicio
        const response = await buscarUsuarioPorIdentificacion(Number(texto))
        const data = response.data

        // Normalizar: puede venir objeto, null o estructura vacía
        let empleadoEncontradoObj = null
        if (data && typeof data === 'object') {
          empleadoEncontradoObj = data
        }

        // Consideramos válido solo si tiene campos útiles
        const tieneCamposUtiles = empleadoEncontradoObj &&
            (empleadoEncontradoObj.identificacion || empleadoEncontradoObj.nombres || empleadoEncontradoObj.apellidos)

        if (tieneCamposUtiles) {
          // Normalizar valores para evitar undefined
          const identificacion = empleadoEncontradoObj.identificacion ?? ''
          const nombres = empleadoEncontradoObj.nombres ?? ''
          const apellidos = empleadoEncontradoObj.apellidos ?? ''

          // Guardar como array para la UI
          this.empleadosFiltrados = [empleadoEncontradoObj]

          // Asignar al formulario
          this.empleado.identificacion = identificacion
          this.empleado.nombres = nombres
          this.empleado.apellidos = apellidos
          this.empleadoEncontrado = true

          this.mostrarMensaje(`✅ Empleado encontrado: ${nombres} ${apellidos}`.trim(), 'success')
        } else {
          // No hay empleado válido
          this.empleadosFiltrados = []
          this.empleado.nombres = ''
          this.empleado.apellidos = ''
          this.empleadoEncontrado = false
          this.mostrarMensaje('⚠️ Empleado no encontrado.', 'warning')
        }

      } catch (error) {
        console.error('❌ Error al buscar Empleado por identificación:', error)

        // Limpieza del estado
        this.empleadosFiltrados = []
        this.empleado.nombres = ''
        this.empleado.apellidos = ''
        this.empleadoEncontrado = false

        // Manejo de errores conocidos
        if (error.message?.includes('Cannot invoke') || error.message?.includes('null')) {
          this.mostrarMensaje('⚠️ Empleado no encontrado.', 'warning')
        } else if (error.message?.includes('404')) {
          this.mostrarMensaje('⚠️ Empleado no encontrado.', 'warning')
        } else {
          this.mostrarMensaje(error.message || '❌ Error en búsqueda de empleado.', 'error')
        }
      }
    },

    // 🔹 Buscar Empleado por nombres
    async buscarEmpleadoPorNombreHandler() {
      const texto = this.empleado.nombres?.trim()

      if (!texto) {
        this.mostrarMensaje('Ingrese un nombre de empleado.', 'error')
        return
      }

      try {
        const response = await buscarUsuarioPorNombres(texto)
        const data = response.data

        // Normalizar: puede venir array, objeto o null
        let empleadoEncontradoObj = null
        if (Array.isArray(data) && data.length > 0 && data[0]) {
          empleadoEncontradoObj = data[0]
        } else if (data && typeof data === 'object') {
          empleadoEncontradoObj = data
        }

        // Consideramos "encontrado" solo si hay al menos un campo útil
        const tieneCamposUtiles = empleadoEncontradoObj &&
            (empleadoEncontradoObj.identificacion || empleadoEncontradoObj.nombres || empleadoEncontradoObj.apellidos)

        if (tieneCamposUtiles) {
          // Normalizar valores para evitar undefined
          const identificacion = empleadoEncontradoObj.identificacion ?? ''
          const nombres = empleadoEncontradoObj.nombres ?? ''
          const apellidos = empleadoEncontradoObj.apellidos ?? ''

          // Guardar como array para la UI (coherente con la otra búsqueda)
          this.empleadosFiltrados = [empleadoEncontradoObj]

          // Asignar al formulario
          this.empleado.identificacion = identificacion
          this.empleado.nombres = nombres
          this.empleado.apellidos = apellidos
          this.empleadoEncontrado = true

          this.mostrarMensaje(`✅ Empleado encontrado: ${nombres} ${apellidos}`.trim(), 'success')
        } else {
          // No hay empleado válido
          this.empleadosFiltrados = []
          this.empleado.identificacion = ''
          this.empleado.apellidos = ''
          this.empleadoEncontrado = false
          this.mostrarMensaje('⚠️ No se encontraron empleados con ese nombre.', 'warning')
        }

      } catch (error) {
        console.error('❌ Error al buscar empleado por nombre:', error)

        // Limpieza del estado
        this.empleadosFiltrados = []
        this.empleado.identificacion = ''
        this.empleado.apellidos = ''
        this.empleadoEncontrado = false

        // Si el backend lanzó un NullPointer o devolvió null tratado como excepción
        if (error.message?.includes('Cannot invoke') || error.message?.includes('null')) {
          this.mostrarMensaje('⚠️ No se encontraron empleados con ese nombre.', 'warning')
        } else if (error.message?.includes('404')) {
          this.mostrarMensaje('⚠️ No se encontraron empleados con ese nombre.', 'warning')
        } else {
          this.mostrarMensaje(error.message || '❌ Error en búsqueda de empleado por nombre.', 'error')
        }
      }
    },

    // 🔹 Método de cargar productos
    async buscarProducto() {
      try {
        let response

        if (this.venta.codigo) {
          response = await buscarProductoPorCodigo(Number(this.venta.codigo))
        } else if (this.venta.producto) {
          response = await buscarProductoPorNombre(this.venta.producto)
        } else if (this.venta.descripcion) {
          response = await buscarProductoPorDescripcion(this.venta.descripcion)
        } else if (this.venta.cantidad) {
          response = await buscarProductoPorCantidad(this.venta.cantidad)
        } else if (this.venta.precio) {
          response = await buscarProductoPorPrecio(this.venta.precio)
        } else {
          this.mostrarMensaje('Ingrese un criterio de búsqueda válido.', 'error')
          return
        }

        const data = response.data
        const producto = Array.isArray(data) ? data[0] : data

        if (!producto) {
          this.mostrarMensaje('Producto no encontrado.', 'error')
          return
        }

        // ✅ Rellenar campos con lo que venga del backend
        // this.venta.codigo = String(producto.codigo || '')
        this.venta.codigo = Number(producto.codigo)
        this.venta.producto = producto.nombre || ''
        this.venta.descripcion = producto.descripcion || ''
        // inicializar cantidad propuesta en 1 para agregar
        this.venta.cantidad = 1
        this.venta.precio = Number(producto.precio) || 0
        // stock del producto en BD
        this.venta.stock = Number(producto.cantidad) || 0

        // ✅ Guardar proveedor
        this.producto.proveedorId = producto.proveedorId || null
        this.producto.proveedorName = producto.proveedorName || ''

      } catch (error) {
        console.error('❌ Error al buscar producto:', error)
        this.mostrarMensaje('Error al buscar producto en el servidor.', 'error')
      }
    },

    // 🔹 Método agregar productos a la tabla
    async agregarItem() {
      // Validaciones mínimas
      if (!this.formValido) {
        this.mostrarMensaje('⚠️ Complete todos los campos antes de agregar.', 'error')
        return
      }

      // validar stock
      if (this.venta.cantidad > this.venta.stock) {
        this.mostrarMensaje('No hay suficiente stock disponible.', 'error')
        return
      }

      // 🚀 Construir el payload para enviar al backend
      // Si no hay cliente registrado, usar "CONSUMIDOR FINAL"
      const idCliente = this.cliente.identificacion ? Number(this.cliente.identificacion) : 0
      const nombreCli = this.cliente.nombres || 'CONSUMIDOR FINAL'
      const apellidoCli = this.cliente.apellidos || 'N/A'

      // Si no hay empleado registrado, usar "CAJERO"
      const idEmpleado = this.empleado.identificacion ? Number(this.empleado.identificacion) : 0
      const nombreEmp = this.empleado.nombres || 'CAJERO'
      const apellidoEmp = this.empleado.apellidos || 'N/A'

      const payload = {
        identificacionCliente: idCliente,
        nombreCliente: nombreCli,
        apellidoCliente: apellidoCli,

        identificacionEmpleado: idEmpleado,
        nombreEmpleado: nombreEmp,
        apellidoEmpleado: apellidoEmp,

        identificacionProveedor: this.producto.proveedorId,
        nombreProveedor: this.producto.proveedorName,
        detalles: [
          {
            codigo: Number(this.venta.codigo),
            producto: this.venta.producto,
            descripcion: this.venta.descripcion,
            cantidad: Number(this.venta.cantidad),
            precio: Number(this.venta.precio)
          }
        ]
      }

      try {
        // 1️⃣ Registrar en órdenes (crea o agrega a orden ABIERTA del cliente)
        const response = await agregarProducto(payload)
        const ordenActualizada = response.data

        // guardar el numeroOrden (UUID) para futuras operaciones (restar)
        this.numeroOrden = ordenActualizada.numeroOrden
        this.numeroFactura = ordenActualizada.numeroFactura

        // Guardar el ID del cliente de la orden para cerrar/eliminar
        this.ordenIdentificacionCliente = ordenActualizada.identificacionCliente ?? idCliente

        // Construir/actualizar la tabla local con la respuesta completa (detalles)
        if (ordenActualizada.detalles && ordenActualizada.detalles.length > 0) {
          // Reemplazar items por resultados del backend (más seguro)
          this.items = ordenActualizada.detalles.map(d => ({
            codigo: d.codigo,
            producto: d.producto,
            descripcion: d.descripcion,
            cantidad: d.cantidad,
            precio: d.precio,
            fechaCreacion: d.fechaCreacion,
            fechaActualizacion: d.fechaActualizacion,
            removeQty: null
          }))
        }

        // 2️⃣ Restar stock en productos
        await restarStockProducto(this.venta.codigo, this.venta.cantidad)

        this.mostrarMensaje(`✅ Producto ${this.venta.producto} agregado correctamente.`, 'success')

        // 3️⃣ Limpiar campos
        this.venta.codigo = ''
        this.venta.producto = ''
        this.venta.descripcion = ''
        this.venta.cantidad = null
        this.venta.precio = null
        this.venta.stock = 0

        this.producto = {
          proveedorId: null,
          proveedorName: ''
        }

      } catch (error) {
        console.error('❌ Error al agregar producto:', error)
        this.mostrarMensaje(error.message || 'Error al agregar producto en el servidor.', 'error')
      }
    },

    // 🔹 Metódo de eliminar/restar cantidad
    async eliminarItem(idx) {
      if (idx >= 0 && idx < this.items.length) {
        const item = this.items[idx]
        const qtyToRemove = Number(item.removeQty)

        // si no se pone nada o qty >= cantidad actual → eliminar todo
        const cantidadARestar = !qtyToRemove || qtyToRemove <= 0 || qtyToRemove >= item.cantidad
            ? item.cantidad : qtyToRemove

        if (!this.numeroOrden) {
          this.mostrarMensaje('⚠️ No hay orden abierta asociada. Vuelve a agregar el producto.', 'error')
          return
        }

        try {
          // 1️⃣ Actualizar en órdenes (pass numeroOrden, codigoProducto, cantidad)
          const response = await restarCantidadProducto(this.numeroOrden, item.codigo, cantidadARestar)
          const ordenActualizada = response.data

          // 2️⃣ Actualizar en productos (stock global)
          await restarStockProducto(item.codigo, -cantidadARestar) // 👈 ojo, aquí sería sumar de nuevo al stock (negativo = devolver)

          // 3️⃣ Actualizar tabla local con los detalles devueltos por el backend
          if (ordenActualizada.detalles && ordenActualizada.detalles.length > 0) {
            this.items = ordenActualizada.detalles.map(d => ({
              codigo: d.codigo,
              producto: d.producto,
              descripcion: d.descripcion,
              cantidad: d.cantidad,
              precio: d.precio,
              fechaCreacion: d.fechaCreacion,
              fechaActualizacion: d.fechaActualizacion,
              removeQty: null
            }))
            this.mostrarMensaje(`➖ Se restaron ${cantidadARestar} unidades del producto ${item.codigo}.`, 'warning')
          } else {
            // si no hay detalles => la orden quedó vacía
            this.items = []
            this.mostrarMensaje(`🗑️ Producto ${item.codigo} eliminado de la orden.`, 'error')
          }
        } catch (error) {
          console.error('❌ Error al restar producto:', error)
          this.mostrarMensaje(error.message || 'Error al restar producto en el servidor.', 'error')
        }
      }
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatos() {
      return this.venta.codigo ||
          this.venta.producto ||
          this.venta.descripcion ||
          this.venta.cantidad ||
          this.venta.precio ||
          this.venta.stock
    },

    // 🔹 Método para saber si hay datos en el formulario
    hayDatosCliente() {
      return this.cliente.identificacion ||
          this.cliente.nombres ||
          this.empleado.identificacion ||
          this.empleado.nombres
    },

    // 🔹 Método para limpiar campos del formulario
    limpiarCampos() {
      this.venta = {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: null,
        precio: null,
        stock: 0
      }
    },

    limpiarFiltro() {
      this.filtroEstado = ''   // Reinicia select
      this.ordenesFiltradas = [] // Opcional: limpiar resultados de la tabla
      // Reset cliente si quieres deshabilitar botones nuevamente
      this.cliente = { identificacion: '', nombres: '', apellidos: '' }
      this.clienteEncontrado = false
      this.empleadoEncontrado = false
      this.ordenEstado = 'ABIERTA'  // o '' si quieres deshabilitar todo
      // 👇 limpiar tabla
      this.items = [];
    },

    // 🔹 Método para limpiar campos del formulario
    limpiarCamposCliente() {
      this.cliente = {
        identificacion: '',
        nombres: '',
        apellidos: ''
      };
      this.clienteEncontrado = false
    },

    // 🔹 Método para iniciar nueva venta
    agregarCliente() {
      this.cliente = { identificacion: '', nombres: '', apellidos: '' }
      this.clienteEncontrado = false
      this.ordenEstado = 'ABIERTA'
      this.valorPagado = 0
      this.items = []
      this.numeroOrden = null
      this.numeroFactura = null
      this.ordenIdentificacionCliente = null
      this.ordenSeleccionada = null
      this.ordenCargada = false
      this.filtroEstado = ''
      this.ordenesFiltradas = []
      this.descuentoAplicado = 0
      this.descuentoValor = 0
      this.ordenComentario = ''
      this.venta = { codigo: '', producto: '', descripcion: '', cantidad: null, precio: null, stock: 0 }
      // 🔹 Volver a cargar empleado desde sesión (nunca se borra)
      this.cargarEmpleadoDesdeSession()
      this.mostrarMensaje('✅ Listo para registrar una nueva venta.', 'success');
    },

    // ✅ Abrir modal de confirmacion para cerrar venta
    abrirModalCerrarVenta() {
      // Resetear pagos mixtos con el valor que ya haya ingresado en "Recibido"
      this.pagosMixtos = {
        efectivo: this.valorPagado || 0,
        tarjetaDebito: 0,
        tarjetaCredito: 0,
        transferencia: 0,
        referencia: '',
        comentario: ''
      }
      this.modalCerrarVenta = true
    },

    // 🔹 Validar antes de mostrar confirmación final
    validarAntesDeConfirmar() {
      // Si el pago es insuficiente y no hay comentario, mostrar alerta informativa
      if (this.totalPagosMixtos < this.calcularTotalFinal && !this.pagosMixtos.comentario.trim()) {
        this.modalAlertaComentario = true
        return
      }
      this.modalConfirmacionFinal = true
    },

    // ✅ Confirmar y ejecutar el cierre de venta con pagos mixtos
    async confirmarCerrarVenta() {
      this.modalConfirmacionFinal = false
      this.modalCerrarVenta = false

      // Usar la identificacion del cliente almacenada en la orden (no del input)
      const idCliente = this.ordenIdentificacionCliente !== null
          ? Number(this.ordenIdentificacionCliente)
          : (this.cliente.identificacion ? Number(this.cliente.identificacion) : 0)

      // 🔹 Construir lista de pagos (solo los que tienen valor > 0)
      const pagos = []
      if (this.pagosMixtos.efectivo > 0) {
        pagos.push({ metodoPago: 'EFECTIVO', valor: this.pagosMixtos.efectivo, referencia: null })
      }
      if (this.pagosMixtos.tarjetaDebito > 0) {
        pagos.push({ metodoPago: 'TARJETA_DEBITO', valor: this.pagosMixtos.tarjetaDebito, referencia: this.pagosMixtos.referencia || null })
      }
      if (this.pagosMixtos.tarjetaCredito > 0) {
        pagos.push({ metodoPago: 'TARJETA_CREDITO', valor: this.pagosMixtos.tarjetaCredito, referencia: this.pagosMixtos.referencia || null })
      }
      if (this.pagosMixtos.transferencia > 0) {
        pagos.push({ metodoPago: 'TRANSFERENCIA', valor: this.pagosMixtos.transferencia, referencia: this.pagosMixtos.referencia || null })
      }

      const payload = {
        identificacionCliente: idCliente,
        numeroOrden: this.numeroOrden || null,
        valorRecibido: this.totalPagosMixtos,
        descuentoTipo: this.descuentoAplicado > 0 ? (this.descuentoTipo === 'porcentaje' ? 'PORCENTAJE' : 'FIJO') : null,
        descuentoValor: this.descuentoAplicado > 0 ? this.descuentoValor : null,
        descuentoAplicado: this.descuentoAplicado > 0 ? this.descuentoAplicado : null,
        pagos: pagos,
        comentario: this.pagosMixtos.comentario || null
      }

      try {
        const response = await cerrarOrdenConPagosMixtos(payload)

        // 🔥 Guardar número de factura para el ticket
        this.numeroFactura = response.data.numeroFactura

        // Actualizar el valorPagado para el ticket
        this.valorPagado = this.totalPagosMixtos

        // Marcar la orden como cerrada
        this.ordenEstado = 'CERRADA'
        this.numeroOrden = null

        // 🔹 Guardar snapshot del ticket ANTES de resetear
        const snapshotFactura = {
          numero: response.data.numeroFactura,
          fecha: this.facturaTicket.fecha,
          clienteNombre: this.facturaTicket.clienteNombre,
          clienteCC: this.facturaTicket.clienteCC,
          vendedorNombre: this.facturaTicket.vendedorNombre,
          vendedorCC: this.facturaTicket.vendedorCC,
          productos: [...this.items.map(i => ({
            nombre: i.producto,
            descripcion: i.descripcion,
            cantidad: i.cantidad,
            precio: i.precio
          }))],
          total: this.calcularSubtotal,
          totalFinal: this.calcularTotalFinal
        }

        this.ticketData = {
          factura: snapshotFactura,
          recibido: this.totalPagosMixtos,
          descuento: this.descuentoAplicado,
          descuentoInfo: this.descuentoAplicado > 0 ? (this.descuentoTipo === 'porcentaje' ? '(' + this.descuentoValor + '%)' : '') : ''
        }

        this.mostrarMensaje('✅ Venta cerrada correctamente con ' + pagos.length + ' método(s) de pago.', 'success')

        // 🔹 Limpiar todo para nueva venta
        this.resetVenta()

      } catch (error) {
        console.error('❌ Error al cerrar venta:', error)
        this.mostrarMensaje(error.message || 'Error al cerrar la venta en el servidor.', 'error')
      }
    },

    // 🔹 Método auxiliar para reiniciar todo
    resetVenta() {
      this.cliente = {
        identificacion: '',
        nombres: '',
        apellidos: ''
      }
      this.empleado = {
        identificacion: '',
        nombres: '',
        apellidos: ''
      }
      this.venta = {
        codigo: '',
        producto: '',
        descripcion: '',
        cantidad: 0,
        precio: 0,
        stock: 0
      }
      this.items = []
      this.valorPagado = 0
      this.descuentoAplicado = 0
      this.descuentoValor = 0
      this.descuentoTipo = 'porcentaje'
      this.numeroOrden = null
      this.numeroFactura = null
      this.ordenIdentificacionCliente = null
      this.ordenSeleccionada = null
      this.ordenCargada = false
      this.ordenesFiltradas = []
      // this.filtroEstado = 'ABIERTA'
      this.filtroEstado = ''
      this.filtrarPorCliente = false
      this.clienteEncontrado = false
      this.empleadoEncontrado = false
      this.ordenEstado = 'ABIERTA' // 🔹 Resetear estado para permitir nueva venta
      this.ordenComentario = ''
      this.pagosMixtos = { efectivo: 0, tarjetaDebito: 0, tarjetaCredito: 0, transferencia: 0, referencia: '', comentario: '' }
      // 🔹 Volver a cargar empleado desde sesión
      this.cargarEmpleadoDesdeSession()
    },

    // 🔹 Método para manejar formato de precios
    formatPrecioCOP(valor) {
      if (valor === null || valor === undefined) return '$0'

      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(valor)
    },

    // 🔹 Formato de precio para input (sin simbolo $, solo separadores de miles)
    formatPrecioInput(valor) {
      if (valor === null || valor === undefined || valor === 0 || valor === '') return ''
      return new Intl.NumberFormat('es-CO').format(valor)
    },

    // 🏷️ Aplicar descuento
    aplicarDescuento() {
      if (this.descuentoTipo === 'porcentaje') {
        this.descuentoAplicado = Math.round(this.calcularSubtotal * this.descuentoValor / 100)
      } else {
        this.descuentoAplicado = this.descuentoValor
      }
      this.mostrarModalDescuento = false
    },

    // 🏷️ Quitar descuento
    quitarDescuento() {
      this.descuentoAplicado = 0
      this.descuentoValor = 0
      this.descuentoTipo = 'porcentaje'
      this.mostrarModalDescuento = false
    },

    // 💲 Seleccionar valor rapido para recibido
    seleccionarValorRapido(valor) {
      this.valorPagado = valor
      this.mostrarValoresRapidos = false
    },

    // 💲 Cerrar grilla al hacer clic fuera
    cerrarValoresRapidos() {
      this.mostrarValoresRapidos = false
    },

    // 🔹 Método para el cálculo del total de la órden (con descuento si aplica)
    totalOrden(orden) {
      const subtotal = (orden.detalles || []).reduce((sum, d) => sum + d.cantidad * d.precio, 0)
      const descuento = orden.descuentoAplicado || 0
      return Math.max(subtotal - descuento, 0)
    },

    async confirmarEliminarOrden() {
      try {
        // cerrar modal
        this.modalEliminarOrden.visible = false

        // 1️⃣ DEVOLVER STOCK
        for (const item of this.items) {
          await restarStockProducto(item.codigo, -item.cantidad)
        }

        // 2️⃣ ELIMINAR ORDEN
        await eliminarOrdenCliente(
            this.modalEliminarOrden.numeroOrden,
            this.modalEliminarOrden.cliente.identificacion
        )

        // 3️⃣ LIMPIAR TODO (incluye cliente, empleado, items, etc.)
        this.items = []
        this.numeroOrden = null
        this.ordenIdentificacionCliente = null
        this.ordenEstado = 'ABIERTA'
        this.ordenSeleccionada = null
        this.ordenCargada = false
        this.cliente = { identificacion: '', nombres: '', apellidos: '' }
        this.empleado = { identificacion: '', nombres: '', apellidos: '' }
        this.clienteEncontrado = false
        this.empleadoEncontrado = false
        this.valorPagado = 0
        this.descuentoAplicado = 0
        this.descuentoValor = 0
        this.numeroFactura = null

        this.mostrarMensaje('🗑️ Orden eliminada correctamente.', 'success')

        // Recargar ordenes filtradas si hay filtro activo
        if (this.filtroEstado) {
          await this.cargarOrdenesFiltradas()
        }

      } catch (error) {
        console.error('❌ Error al eliminar orden:', error)
        this.mostrarMensaje(
            error.message || 'Error al eliminar la orden.',
            'error'
        )
      }
    },

    abrirModalEliminarOrden() {
      if (!this.numeroOrden) {
        this.mostrarMensaje('⚠️ No hay una orden valida para eliminar.', 'warning')
        return
      }

      // Usar la identificacion del cliente almacenada en la orden
      const idCliente = this.ordenIdentificacionCliente !== null
          ? this.ordenIdentificacionCliente
          : (this.cliente.identificacion || 0)

      this.modalEliminarOrden = {
        visible: true,
        numeroOrden: this.numeroOrden,
        cliente: {
          identificacion: idCliente,
          nombres: this.cliente.nombres || 'CONSUMIDOR FINAL'
        }
      }
    },

    // ✅ Logica para imprimir
    async imprimirFactura() {
      if (!this.numeroFactura) {
        // generar número provisional (solo para mostrar)
        this.numeroFactura = `TMP-${Date.now()}`
      }

      // 👇 Espera a que Vue actualice el DOM
      await this.$nextTick()

      window.print()
    }
  }
}
</script>



<style scoped>
.nueva-venta-wrapper {
  display: flex;
}

.venta-container {
  position: absolute;
  top: 0;
  left: 60px; /* ancho colapsado del menu */
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

.venta-container.expanded {
  left: 220px; /* menu desplegable */
}

.titulo {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  margin-top: -10px;    /* espacio desde arriba */
}

.buscar-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 12px;        /* De aqui al final del boton era otro */
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

.mensaje {
  padding: 12px 18px;
  border-radius: 6px;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: center;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.15);
}

.mensaje.success {
  background: #2ecc71;
  color: white;
}

.mensaje.warning {
  background: #f1c40f;
  color: #333;
}

.mensaje.error {
  background: #e74c3c;
  color: white;
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

.agregar-btn:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
}

.limpiar-campos-btn {
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 8px 12px;        /* De aqui al final del boton era otro */
  background: #f4a261;
  color: white;
}

.limpiar-campos-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.productos-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.productos-table th {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.productos-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  background: white;
}

.precio-total-cell {
  background-color: white;
  text-align: center;
  font-weight: 700;
  color: #0b3954;
  padding: 4px 0;
}

.cantidad-cell {
  background: white;
  text-align: center;
  vertical-align: middle;
}

.cantidad-cell .mini-controls {
  margin-top: 4px;
}

.mini-controls {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
}

.mini-input {
  width: 70px;
  padding: 4px 6px;
  font-size: 0.9rem;
  border-radius: 4px;
  border: 1px solid #bbb;
  text-align: center;
}

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

.empty-row {
  text-align: center;
  padding: 18px;
  color: #666;
}

.footer-venta {
  margin-top: auto;
  padding-top: 20px;
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

.acciones-footer button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #005b82;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.acciones-footer button:hover {
  background: #004466;
}

.acciones-footer button:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
}

.cerrar-venta-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: #28a745;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.cerrar-venta-btn:hover {
  background: #1e7e34;
}

.cerrar-venta-btn:disabled {
  background: #a0c4d6;
  cursor: not-allowed;
}

.total {
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  flex-direction: column; /* clave */
  gap: 4px; /* opcional, espacio entre lineas */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px 30px;
  border-radius: 8px;
  text-align: center;
  min-width: 300px;
  box-shadow: 0px 8px 16px rgba(0,0,0,0.25);
}

.modal-buttons {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-yes {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #c92a2a;
  color: white;
}

.btn-yes:hover {
  background: #a12222;
}

.btn-no {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: #06d6a0;
  color: #1c1c1c;
}

.btn-no:hover {
  background: #049670;
}

.pago-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  position: relative;
}

.pago-container input {
  width: 140px;
}

.pago-input-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-valores-rapidos {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}
.btn-valores-rapidos:hover { background: #f0f0f0; }
.btn-valores-rapidos:disabled { opacity: 0.4; cursor: not-allowed; }

.valores-rapidos {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  background: white;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 100;
  width: 340px;
  margin-bottom: 6px;
}

.valores-rapidos button {
  padding: 8px 4px;
  border: 1px solid #0077b6;
  border-radius: 6px;
  background: #e8f4fd;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  color: #0077b6;
}
.valores-rapidos button:hover {
  background: #0077b6;
  color: white;
  border-color: #0077b6;
}

/* Ticket oculto en pantalla, visible solo al imprimir */
#ticket-print {
  display: none;
}

/* Descuento */
.descuento-linea {
  color: #e63946;
  font-size: 0.9rem;
}

.btn-descuento {
  margin-top: 6px;
  padding: 4px 10px;
  font-size: 11px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-weight: 600;
}
.btn-descuento:hover { background: #f0f0f0; }
.btn-descuento:disabled { opacity: 0.4; cursor: not-allowed; }

.modal-overlay-descuento {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
}

.modal-descuento {
  background: white;
  border-radius: 10px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.25);
  text-align: center;
}
.modal-descuento h3 { margin-bottom: 12px; color: #333; }

.desc-tipo {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 13px;
}
.desc-tipo label { cursor: pointer; }

.desc-input {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}
.desc-input input {
  width: 120px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}
.desc-sufijo { font-weight: bold; font-size: 14px; }

.desc-preview {
  background: #f9f9f9;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  text-align: left;
}
.desc-preview p { margin: 3px 0; }

.desc-botones {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn-aplicar-desc {
  padding: 6px 14px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-aplicar-desc:disabled { background: #ccc; cursor: not-allowed; }
.btn-quitar-desc {
  padding: 6px 14px;
  background: #e63946;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.btn-cancelar-desc {
  padding: 6px 14px;
  background: #666;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
</style>

<!-- Estilos globales de impresion (sin scoped para controlar body) -->
<style>
@media print {
  /* Ocultar todo excepto el ticket */
  body * {
    visibility: hidden !important;
  }

  #ticket-print,
  #ticket-print * {
    visibility: visible !important;
  }

  #ticket-print {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 58mm;
    padding: 0;
    margin: 0;
  }

  @page {
    size: 58mm auto;
    margin: 0;
  }

  body {
    margin: 0 !important;
    padding: 0 !important;
  }
}
</style>
