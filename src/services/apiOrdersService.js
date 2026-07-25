// src/services/apiOrdersService.js

import { createAxiosWithAuth } from "@/services/axiosWithAuthRefreshToken";

// =======================
// 🔹 Cliente Axios para Órders
// =======================
export const apiOrders = createAxiosWithAuth(
  process.env.VUE_APP_ORDERS_BASE_URL,
);

// =======================
// 📦 ENDPOINTS DEL MICROSERVICIO DE ÓRDENES
// =======================

// Agregar producto a tabla (crea o actualiza orden ABIERTA del cliente)
export const agregarProducto = (producto) =>
  apiOrders.post("/ordenes-ventas/register", producto);

// Restar cantidad (o eliminar si llega a 0) en órdenes
// ahora recibe numeroOrden (String), codigoProducto (Long) y cantidad (int)
export const restarCantidadProducto = (numeroOrden, codigoProducto, cantidad) =>
  apiOrders.put(`/ordenes-ventas/restar/${numeroOrden}`, null, {
    params: { codigo: codigoProducto, cantidad },
  });

// Cerrar orden por cliente (con valor recibido)
export const cerrarOrdenPorCliente = (identificacionCliente, valorRecibido) =>
  apiOrders.patch(
    `/ordenes-ventas/cliente/orden/cerrar/${identificacionCliente}`,
    null,
    {
      params: { valorRecibido },
    },
  );

// 🔹 Nuevo: Cerrar orden con pagos mixtos y descuento persistido
// payload: { identificacionCliente, valorRecibido, descuentoTipo, descuentoValor, descuentoAplicado, pagos: [{metodoPago, valor, referencia}] }
export const cerrarOrdenConPagosMixtos = (payload) =>
  apiOrders.patch("/ordenes-ventas/cliente/orden/cerrar-v2", payload);

// Listar todas las órdenes por estado
export const listarOrdenesPorEstado = (estado) =>
  apiOrders.get("/ordenes-ventas/list/estado", { params: { estado } });

// Listar órdenes por cliente y estado
export const listarOrdenesPorClienteYEstado = (identificacionCliente, estado) =>
  apiOrders.get("/ordenes-ventas/list/cliente", {
    params: { cliente: identificacionCliente, estado },
  });

// Listar todas las órdenes (sin filtros)
export const listarTodasLasOrdenes = () =>
  apiOrders.get("/ordenes-ventas/list/all");

export const eliminarOrdenCliente = (numeroOrden, cliente) =>
  apiOrders.delete(`/ordenes-ventas/delete/${numeroOrden}`, {
    params: { cliente },
  });

// Busqueda por fecha de creacion (rango)
export const buscarOrdenesPorFechaCreacion = (fechaInicio, fechaFin) =>
  apiOrders.get("/ordenes-ventas/fechaCreacion", {
    params: { fechaInicio, fechaFin },
  });

// 🔹 Búsquedas individuales para Historial de Ventas (desde backend)
export const buscarOrdenesPorCliente = (cliente) =>
  apiOrders.get("/ordenes-ventas/buscar/cliente", { params: { cliente } });
export const buscarOrdenesPorIdCliente = (idCliente) =>
  apiOrders.get("/ordenes-ventas/buscar/idCliente", { params: { idCliente } });
export const buscarOrdenesPorVendedor = (vendedor) =>
  apiOrders.get("/ordenes-ventas/buscar/vendedor", { params: { vendedor } });
export const buscarOrdenesPorIdVendedor = (idVendedor) =>
  apiOrders.get("/ordenes-ventas/buscar/idVendedor", {
    params: { idVendedor },
  });
export const buscarOrdenesPorFactura = (factura) =>
  apiOrders.get("/ordenes-ventas/buscar/factura", { params: { factura } });
export const buscarOrdenesPorProducto = (producto) =>
  apiOrders.get("/ordenes-ventas/buscar/producto", { params: { producto } });
export const buscarOrdenesPorEstado = (estado) =>
  apiOrders.get("/ordenes-ventas/list/estado", { params: { estado } });
