// src/services/apiConfigEmpresaUsuariosService.js
import axios from 'axios'
import router from '@/router'

const apiConfigEmpresaUsuario = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

apiConfigEmpresaUsuario.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

apiConfigEmpresaUsuario.interceptors.response.use(
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

// Listar todos los usuarios
export const listarUsuarios = () => apiConfigEmpresaUsuario.get('/usuario/list/all')

// Registrar usuario
export const registrarUsuario = (usuario) => apiConfigEmpresaUsuario.post('/usuario/register', usuario)

// Búsqueda de usuario por identificación
export const buscarUsuarioPorIdentificacion = (identificacion) => apiConfigEmpresaUsuario.get('/usuario/identificacion', { params: { identificacion } })

// Buscar por userName
export const buscarUsuarioPorUserName = (userName) => apiConfigEmpresaUsuario.get('/usuario/userName', { params: { userName } })

// Buscar por nombres
export const buscarUsuarioPorNombres = (nombres) => apiConfigEmpresaUsuario.get('/usuario/nombres', { params: { nombres } })

// Buscar por apellidos
export const buscarUsuarioPorApellidos = (apellidos) => apiConfigEmpresaUsuario.get('/usuario/apellidos', { params: { apellidos } })

// Buscar por roleName
export const buscarUsuarioPorRoleName = (roleName) => apiConfigEmpresaUsuario.get('/usuario/roleName', { params: { roleName } })

// Actualizar usuario
export const actualizarUsuario = (usuario) => apiConfigEmpresaUsuario.put('/usuario/update', usuario)

// Eliminar usuario
export const eliminarUsuario = (identificacion) => apiConfigEmpresaUsuario.delete('/usuario/delete', { params: { identificacion } })

// Obtener usuario actual autenticado
export const obtenerUsuarioActual = async (token) => {
  try {
    const response = await apiConfigEmpresaUsuario.get('/authentication/obtener-usuario-actual', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response
  } catch (error) {
    console.error('❌ Error al obtener usuario actual:', error)
    throw error
  }
}

// Buscar usuario por login
export const buscarUsuarioPorLogin = (login) => apiConfigEmpresaUsuario.get(`/usuario/login?userName=${login}`)

