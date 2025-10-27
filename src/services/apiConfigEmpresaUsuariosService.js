// src/services/apiConfigEmpresaUsuariosService.js
import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

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
// 📡 ENDPOINTS PARA USUARIOS
// ===============================
export const listarUsuarios = () => apiClient.get('/usuario/list/all')
export const registrarUsuario = (usuario) => apiClient.post('/usuario/register', usuario)
export const actualizarUsuario = (usuario) => apiClient.put('/usuario/update', usuario)
export const eliminarUsuario = (identificacion) =>
  apiClient.delete('/usuario/delete', { params: { identificacion } })
