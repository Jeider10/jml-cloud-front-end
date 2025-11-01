// src/services/apiConfigEmpresaRolesService.js
import axios from 'axios'
import router from '@/router'

const apiConfigEmpresaRole = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// 🔐 Interceptor de request: agrega token
apiConfigEmpresaRole.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// ⚠️ Interceptor de response: maneja expiración de sesión
apiConfigEmpresaRole.interceptors.response.use(
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

// Listar todos los roles
export const listarRoles = () => apiConfigEmpresaRole.get('/roles/list/all')

// Registrar role
export const registrarRole = (role) => apiConfigEmpresaRole.post('/roles/register', role)

// Búsqueda de role por roleCode
export const buscarRolePorRoleCode = (roleCode) => apiConfigEmpresaRole.get('/roles/roleCode', { params: { roleCode } })

// Actualizar role
export const actualizarRole = (role) => apiConfigEmpresaRole.put('/roles/update', role)

// Eliminar role
export const eliminarRole = (roleCode) => apiConfigEmpresaRole.delete('/roles/delete', { params: { roleCode } })
