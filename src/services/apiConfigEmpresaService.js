// src/services/apiConfigEmpresaService.js

import axios from 'axios'
import router from '@/router'

const apiConfigEmpresa = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token
apiConfigEmpresa.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor de errores
apiConfigEmpresa.interceptors.response.use(
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
export const obtenerPrimeraEmpresa = () => apiConfigEmpresa.get('/empresa')

// Obtener empresa por nit
export const obtenerEmpresa = (nit) => apiConfigEmpresa.get(`/empresa/${nit}`)

// Registrar nueva empresa (usa multipart/form-data)
export const registrarEmpresa = (empresa, file) => {
  const formData = new FormData()
  formData.append('empresa', new Blob([JSON.stringify(empresa)], { type: 'application/json' }))
  if (file) {
    formData.append('file', file)
  }

  return apiConfigEmpresa.post('/empresa/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Actualizar datos de la empresa (usa multipart/form-data)
export const actualizarEmpresa = (empresa, file) => {
  const formData = new FormData()
  formData.append('empresa', new Blob([JSON.stringify(empresa)], { type: 'application/json' }))
  if (file) {
    formData.append('file', file)
  }

  return apiConfigEmpresa.put('/empresa/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Eliminar empresa por NIC
export const eliminarEmpresa = (nit) =>
  apiConfigEmpresa.delete('/empresa/delete', { params: { nit } })
