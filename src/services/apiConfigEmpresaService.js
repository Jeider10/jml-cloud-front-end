// src/services/apiConfigEmpresaService.js

import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor de errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('authUsername')
      router.push('/login')
      console.warn('⚠️ Sesión expirada. Por favor inicia sesión nuevamente.')
    }
    const message = error.response?.data?.message || error.message || 'Error en la petición'
    return Promise.reject(new Error(message))
  }
)

// ==============================
// 🔹 Endpoints del microservicio Empresa
// ==============================

// Obtener la primera empresa (si existe)
export const obtenerPrimeraEmpresa = () => apiClient.get('/empresa')

// Obtener empresa por nic
export const obtenerEmpresa = (nic) => apiClient.get(`/empresa/${nic}`)

// Registrar nueva empresa
export const registrarEmpresa = (empresa) =>
  apiClient.post('/empresa/register', empresa)

// Actualizar datos de la empresa
export const actualizarEmpresa = (empresa) =>
  apiClient.put('/empresa/update', empresa)

// Eliminar empresa por NIC
export const eliminarEmpresa = (nic) =>
  apiClient.delete('/empresa/delete', { params: { nic } })
