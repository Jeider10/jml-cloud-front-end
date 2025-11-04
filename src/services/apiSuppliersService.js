// src/services/apiSuppliersService.js

import axios from 'axios'
import { sessionData, clearSession, setSession } from '@/services/sessionService'
import { refreshToken } from '@/services/apiAuthService'
import router from '@/router'

// =======================
// 🔹 Cliente Axios Suppliers
// =======================
const apiSuppliers = axios.create({
  baseURL: process.env.VUE_APP_SUPPLIERS_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// =======================
// 🔐 Interceptor de Request
// =======================
apiSuppliers.interceptors.request.use(config => {
  if (sessionData.accessToken) {
    config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
  }
  return config
})

// =======================
// ⚠️ Interceptor de response con manejo de expiración
// =======================
apiSuppliers.interceptors.response.use(
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
        return apiSuppliers.request(error.config)
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
// 🧩 ENDPOINTS DEL MICROSERVICIO DE PROVEEDORES
// =======================

// Listar todos los proveedores
export const listarProveedores = () => apiSuppliers.get('/proveedores/list/all')

// Crear proveedor
export const crearProveedor = (proveedor) => apiSuppliers.post('/proveedores/register', proveedor)

// Búsqueda por código de sucursal
export const buscarProveedorPorCodigoSucursal = (codigoSucursal) => apiSuppliers.get('/proveedores/codigoSucursal', { params: { codigoSucursal } })

// Búsqueda por nombre
export const buscarProveedorPorNombre = (nombre) => apiSuppliers.get('/proveedores/nombre', { params: { nombre } })

// Actualizar proveedor
export const actualizarProveedor = (proveedor) => apiSuppliers.put('/proveedores/update', proveedor)

// Eliminar proveedor por código de sucursal
export const eliminarProveedorPorCodigoSucursal = (codigoSucursal) => apiSuppliers.delete('/proveedores/delete', { params: { codigoSucursal } })
