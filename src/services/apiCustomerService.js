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

    // 👇 Devolver siempre un Error válido
    return Promise.reject(
      error instanceof Error ? error : new Error(error.message || 'Error en la petición')
    )
  }
)

// =======================
// 🔹 Endpoints del microservicio de clientes
// =======================

// Listar todos los clientes
export const listarClientes = () => {
  return apiClient.get('/clientes/listar-todos')
}

// Crear cliente
//export const crearCliente = (cliente) => {
//  // cliente = { identificacion, nombres, apellidos, telefono, direccion }
//  return apiClient.post('/clientes/register', cliente)
//}

//
//// Buscar cliente por identificación
//export const buscarClientePorIdentificacion = (identificacion) => {
//  return apiClient.get(`/clientes/${identificacion}`)
//}
//
//// Actualizar cliente
//export const actualizarCliente = (cliente) => {
//  return apiClient.put(`/clientes/${cliente.identificacion}`, cliente)
//}
//
//// Eliminar cliente
//export const eliminarCliente = (identificacion) => {
//  return apiClient.delete(`/clientes/${identificacion}`)
//}
