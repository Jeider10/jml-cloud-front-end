// src/services/apiOrdersService.js

import axios from 'axios'
import router from '@/router'

const apiOrders = axios.create({
  baseURL: process.env.VUE_APP_ORDERS_BASE_URL, // ⚠️ backend orders ventas
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token en cada request
apiOrders.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor para manejar respuestas de error
apiOrders.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // ❌ Token expirado o inválido
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('authUsername')

      // 🔄 Redirigir al login
      router.push('/login')

      // Opcional: mostrar mensaje en consola
      console.warn('⚠️ Sesión expirada. Por favor inicia sesión nuevamente.')
    }

    // Pasamos un Error con mensaje más útil (si viene del backend lo usamos)
    const message = error.response?.data?.message || error.response?.data || error.message || 'Error en la petición'
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
  }
)

// =======================
// 🔹 Endpoints del microservicio de ordenes
// =======================

// Agregar producto a tabla (crea o actualiza orden ABIERTA del cliente)
export const agregarProducto = (producto) => apiOrders.post('/ordenes-ventas/register', producto)

// Restar cantidad (o eliminar si llega a 0) en órdenes
// ahora recibe numeroOrden (String), codigoProducto (Long) y cantidad (int)
export const restarCantidadProducto = (numeroOrden, codigoProducto, cantidad) =>
  apiOrders.put(`/ordenes-ventas/restar/${numeroOrden}`, null, { params: { codigo: codigoProducto, cantidad } })

// Cerrar orden por cliente
export const cerrarOrdenPorCliente = (identificacionCliente) =>
  apiOrders.patch(`/ordenes-ventas/cliente/orden/cerrar/${identificacionCliente}`)

// Listar todas las órdenes por estado
export const listarOrdenesPorEstado = (estado) =>
  apiOrders.get('/ordenes-ventas/list/estado', { params: { estado } })

// Listar órdenes por cliente y estado
export const listarOrdenesPorClienteYEstado = (identificacionCliente, estado) =>
  apiOrders.get('/ordenes-ventas/list/cliente', { params: { cliente: identificacionCliente, estado } })

// Listar todas las órdenes (sin filtros)
export const listarTodasLasOrdenes = () =>
  apiOrders.get('/ordenes-ventas/list/all')
