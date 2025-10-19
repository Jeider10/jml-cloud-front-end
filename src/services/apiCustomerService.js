// src/services/apiCustomerService.js

import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_CUSTOMER_BASE_URL, // ⚠️ backend autenticacion
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token en cada request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor para manejar respuestas de error
apiClient.interceptors.response.use(
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
// 🔹 Endpoints del microservicio de clientes
// =======================

// Listar todos los clientes
export const listarClientes = () => apiClient.get('/clientes/list/all')

// Crear cliente
export const crearCliente = (cliente) => apiClient.post('/clientes/register', cliente)

// Búsqueda por identificación
export const buscarClientePorIdentificacion = (identificacion) => apiClient.get('/clientes/identificacion', { params: { identificacion } })

// Búsqueda por nombres
export const buscarClientePorNombres = (nombres) => apiClient.get('/clientes/nombres', { params: { nombres } })

// Búsqueda por apellidos
export const buscarClientePorApellidos = (apellidos) => apiClient.get('/clientes/apellidos', { params: { apellidos } })

// Actualizar cliente
export const actualizarCliente = (cliente) => apiClient.put('/clientes/update', cliente)

// Eliminar cliente
export const eliminarClientePorIdentificacion = (identificacion) => apiClient.delete('/clientes/delete', { params: { identificacion } })

