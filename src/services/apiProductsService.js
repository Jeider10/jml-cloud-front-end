// src/services/apiProductsService.js

import axios from 'axios'
import { sessionData, clearSession, setSession } from '@/services/sessionService'
import { refreshToken } from '@/services/apiAuthService'
import router from '@/router'

// =======================
// 🔹 Cliente Axios Products
// =======================
const apiProducts = axios.create({
  baseURL: process.env.VUE_APP_PRODUCTS_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// =======================
// 🔐 Interceptor de Request
// =======================
apiProducts.interceptors.request.use(config => {
  if (sessionData.accessToken) {
    config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
  }
  return config
})

// =======================
// ⚠️ Interceptor de response con manejo de expiración
// =======================
apiProducts.interceptors.response.use(
  response => response,
  async error => {
    // 🔁 Intentar refrescar el token si expira
    if (error.response && error.response.status === 401 && sessionData.refreshToken) {
      try {
        console.warn('♻️ Intentando refrescar token...')
        const refreshResponse = await refreshToken(sessionData.refreshToken)
        setSession(refreshResponse.data)
        // Reintenta la petición original con el nuevo token
        error.config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
        return apiProducts.request(error.config)
      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError)
        clearSession()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

// =======================
// 🧩 ENDPOINTS DEL MICROSERVICIO DE PRODUCTOS
// =======================

// Listar todos los productos
export const listarProductos = () => apiProducts.get('/productos/list/all')

// Crear producto
export const crearProducto = (producto) => apiProducts.post('/productos/register', producto)

// Búsqueda por código
export const buscarProductoPorCodigo = (codigo) => apiProducts.get('/productos/codigo', { params: { codigo } })

// Búsqueda por nombre
export const buscarProductoPorNombre = (nombre) => apiProducts.get('/productos/nombre', { params: { nombre } })

// Búsqueda por descripción
export const buscarProductoPorDescripcion = (descripcion) => apiProducts.get('/productos/descripcion', { params: { descripcion } })

// Búsqueda por cantidad
export const buscarProductoPorCantidad = (cantidad) => apiProducts.get('/productos/cantidad', { params: { cantidad } })

// Búsqueda por precio
export const buscarProductoPorPrecio = (precio) => apiProducts.get('/productos/precio', { params: { precio } })

// Búsqueda por proveedor (id)
export const buscarProductoPorProveedorId = (proveedorId) => apiProducts.get('/productos/proveedorId', { params: { proveedorId } })

// Búsqueda por proveedor (nombre)
export const buscarProductoPorProveedorName = (proveedorName) => apiProducts.get('/productos/proveedorName', { params: { proveedorName } })

// Actualizar producto
export const actualizarProducto = (producto) => apiProducts.put('/productos/update', producto)

// Eliminar producto por código
export const eliminarProductoPorCodigo = (codigo) => apiProducts.delete('/productos/delete', { params: { codigo } })

// Restar stock de un producto por código
export const restarStockProducto = (codigo, cantidad) => apiProducts.put(`/productos/restar-stock/${codigo}`, null, { params: { cantidad } })

// Búsqueda por fecha de creación
export const buscarProductoPorFechaCreacion = (fechaCreacion) => apiProducts.get('/productos/fechaCreacion', { params: { fechaCreacion } })
