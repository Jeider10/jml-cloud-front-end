// src/services/apiCustomerService.js

import axios from 'axios'
import { sessionData, clearSession, setSession } from '@/services/sessionService'
import { refreshToken } from '@/services/apiAuthService'
import router from '@/router'

// =======================
// 🔹 Cliente Axios Customer
// =======================
const apiCustomer = axios.create({
  baseURL: process.env.VUE_APP_CUSTOMER_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// =======================
// 🔐 Interceptor de Request
// =======================
apiCustomer.interceptors.request.use(config => {
  if (sessionData.accessToken) {
    config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
  }
  return config
})

// =======================
// ⚠️ Interceptor de response con manejo de expiración
// =======================
apiCustomer.interceptors.response.use(
  response => response,
  async error => {
    // 🔁 Intentar refrescar el token si expira
    if (error.response && error.response.status === 401 && sessionData.refreshToken) {
      try {
        console.warn('♻️ Intentando refrescar token...')
        // Enviar ambos tokens, no solo refreshToken
        const refreshResponse = await refreshToken(sessionData.refreshToken, sessionData.authorization)

        setSession(refreshResponse.data)

        // 🆕 Usar el nuevo accessToken directamente
        const newAccessToken = refreshResponse.data.authorization
        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`

        // 🆕 Reintentar la petición original
        return apiCustomer.request(error.config)
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
// 📡 ENDPOINTS DEL MICROSERVICIO DE CLIENTES
// =======================

// Listar todos los clientes
export const listarClientes = () => apiCustomer.get('/clientes/list/all')

// Crear cliente
export const crearCliente = (cliente) => apiCustomer.post('/clientes/register', cliente)

// Búsqueda por identificación
export const buscarClientePorIdentificacion = (identificacion) => apiCustomer.get('/clientes/identificacion', { params: { identificacion } })

// Búsqueda por nombres
export const buscarClientePorNombres = (nombres) => apiCustomer.get('/clientes/nombres', { params: { nombres } })

// Búsqueda por apellidos
export const buscarClientePorApellidos = (apellidos) => apiCustomer.get('/clientes/apellidos', { params: { apellidos } })

// Actualizar cliente
export const actualizarCliente = (cliente) => apiCustomer.put('/clientes/update', cliente)

// Eliminar cliente por identificación
export const eliminarClientePorIdentificacion = (identificacion) => apiCustomer.delete('/clientes/delete', { params: { identificacion } })
