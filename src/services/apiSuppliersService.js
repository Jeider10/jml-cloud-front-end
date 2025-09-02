// src/services/apiSuppliersService.js

import axios from 'axios'
import router from '@/router'

const apiSuppliers = axios.create({
  baseURL: process.env.VUE_APP_SUPPLIERS_BASE_URL, // ⚠️ backend proveedores
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token en cada request
apiSuppliers.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor para manejar respuestas de error
apiSuppliers.interceptors.response.use(
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
// 🔹 Endpoints del microservicio de proveedores
// =======================

// Listar todos los proveedores
export const listarProveedores = () => apiSuppliers.get('/proveedores/listar-proveedores')

// Crear proveedor
export const crearProveedor = (proveedor) => apiSuppliers.post('/proveedores/register', proveedor)

// Búsqueda por NIC
export const buscarProveedorPorNic = (nic) => apiSuppliers.get('/proveedores/nic', { params: { nic } })

// Búsqueda por nombre
export const buscarProveedorPorNombre = (nombre) => apiSuppliers.get('/proveedores/nombre', { params: { nombre } })

// Actualizar proveedor
export const actualizarProveedor = (proveedor) => apiSuppliers.put('/proveedores/actualizar', proveedor)

// Eliminar proveedor
export const eliminarProveedorPorNic = (nic) => apiSuppliers.delete('/proveedores/eliminar-nic', { params: { nic } })
