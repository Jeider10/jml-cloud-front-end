// src/services/apiConfigEmpresaRolesService.js
import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// 🔐 Interceptor de request: agrega token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// ⚠️ Interceptor de response: maneja expiración de sesión
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

// ===============================
// 📡 ENDPOINTS PARA ROLES
// ===============================
export const listarRoles = () => apiClient.get('/roles/list/all')
export const registrarRole = (role) => apiClient.post('/roles/register', role)
export const actualizarRole = (role) => apiClient.put('/roles/update', role)
export const eliminarRole = (roleCode) =>
  apiClient.delete('/roles/delete', { params: { roleCode } })
