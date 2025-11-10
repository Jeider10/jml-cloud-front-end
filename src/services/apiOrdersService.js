// src/services/apiOrdersService.js

import { createAxiosWithAuth } from '@/services/axiosWithAuthRefreshToken'

// =======================
// 🔹 Cliente Axios para Órders
// =======================
export const apiOrders = createAxiosWithAuth(process.env.VUE_APP_ORDERS_BASE_URL)

// =======================
// 📦 ENDPOINTS DEL MICROSERVICIO DE ÓRDENES
// =======================

// Agregar producto a tabla (crea o actualiza orden ABIERTA del cliente)
export const agregarProducto = (producto) => apiOrders.post('/ordenes-ventas/register', producto)

// Restar cantidad (o eliminar si llega a 0) en órdenes
// ahora recibe numeroOrden (String), codigoProducto (Long) y cantidad (int)
export const restarCantidadProducto = (numeroOrden, codigoProducto, cantidad) =>
  apiOrders.put(`/ordenes-ventas/restar/${numeroOrden}`, null, {
    params: { codigo: codigoProducto, cantidad }
  })

// Cerrar orden por cliente
export const cerrarOrdenPorCliente = (identificacionCliente) => apiOrders.patch(`/ordenes-ventas/cliente/orden/cerrar/${identificacionCliente}`)

// Listar todas las órdenes por estado
export const listarOrdenesPorEstado = (estado) => apiOrders.get('/ordenes-ventas/list/estado', { params: { estado } })

// Listar órdenes por cliente y estado
export const listarOrdenesPorClienteYEstado = (identificacionCliente, estado) =>
  apiOrders.get('/ordenes-ventas/list/cliente', {
    params: { cliente: identificacionCliente, estado }
  })

// Listar todas las órdenes (sin filtros)
export const listarTodasLasOrdenes = () => apiOrders.get('/ordenes-ventas/list/all')
