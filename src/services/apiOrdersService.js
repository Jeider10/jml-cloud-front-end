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
// 🔹 Endpoints del microservicio de producto
// =======================

// Agregar producto a tabla
export const agregarProducto = (producto) => apiOrders.post('/ordenes-ventas/register', producto)

// Restar cantidad (o eliminar si llega a 0) en órdenes
export const restarCantidadProducto = (codigo, cantidad) =>
  apiOrders.put(`/ordenes-ventas/restar/${codigo}`, null, { params: { cantidad } })

// Listar todos los productos
export const listarProductos = () => apiOrders.get('/productos/listar-productos')

// Búsqueda por codigo
export const buscarProductoPorCodigo = (codigo) =>
  apiOrders.get('/productos/codigo', { params: { codigo } })

// Búsqueda por nombre
export const buscarProductoPorNombre = (nombre) =>
  apiOrders.get('/productos/nombre', { params: { nombre } })

// Búsqueda por descripcion
export const buscarProductoPorDescripcion = (descripcion) =>
  apiOrders.get('/productos/descripcion', { params: { descripcion } })

// Búsqueda por cantidad
export const buscarProductoPorCantidad = (cantidad) =>
  apiOrders.get('/productos/cantidad', { params: { cantidad } })

// Búsqueda por precio
export const buscarProductoPorPrecio = (precio) =>
  apiOrders.get('/productos/precio', { params: { precio } })

// Búsqueda por proveedor por id
export const buscarProductoPorProveedorId = (proveedorId) =>
  apiOrders.get('/productos/proveedorId', { params: { 'proveedorId': proveedorId } })

// Búsqueda por proveedor por nombre
export const buscarProductoPorProveedorName = (proveedorName) =>
  apiOrders.get('/productos/proveedorName', { params: { 'proveedorName': proveedorName } })

// Búsqueda por fechaCreacion
export const buscarProductoPorFechaCreacion = (fechaCreacion) =>
  apiOrders.get('/productos/fechaCreacion', { params: { fechaCreacion } })

// Actualizar producto
export const actualizarProducto = (producto) => {
  return apiOrders.put('/productos/actualizar', producto)
}

// Eliminar producto por codigo
export const eliminarProductoPorCodigo = (codigo) =>
  apiOrders.delete('/productos/eliminar-codigo', { params: { codigo } })

