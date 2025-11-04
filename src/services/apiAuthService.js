// src/services/apiAuthService.js

import axios from 'axios'
import router from '@/router'
import { sessionData, setSession, clearSession } from '@/services/sessionService'

// =======================
// 🔹 Cliente Axios Autenticación
// =======================
const apiAuthentication = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// =======================
// 🔐 Interceptor de Request
// =======================
apiAuthentication.interceptors.request.use(config => {
  if (sessionData.accessToken) {
    config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
  }
  return config
})

// =======================
// ⚠️ Interceptor de response con manejo de expiración
// =======================
apiAuthentication.interceptors.response.use(
  response => response,
  async error => {
    // 🔁 Intentar refrescar el token si expira
    if (error.response && error.response.status === 401 && sessionData.refreshToken) {
      try {
        console.warn('♻️ Intentando refrescar token...')
        const refreshResponse = await refreshToken(sessionData.refreshToken)
        setSession(refreshResponse.data)
        // Reintenta la petición original con el nuevo token
        error.config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
        return apiAuthentication.request(error.config)
      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError)
        await logoutBackend()
        clearSession()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

// =======================
// 🔹 Endpoints de autenticación
// =======================

// Login
export const login = async (usuario, password) => {
  const response = await apiAuthentication.post('/authentication/login', { usuario, password })
  setSession(response.data)
  return response
}

// Obtener usuario actual (usando token activo)
export const getCurrentUser = () => {
  return apiAuthentication.get('/authentication/obtener-usuario-actual')
}

// Refresh token
export const refreshToken = (refreshTokenValue) => {
  return apiAuthentication.post('/authentication/refresh', { refreshToken: refreshTokenValue })
}

// Logout
export const logoutBackend = async () => {
  if (!sessionData.refreshToken) return
  try {
    await apiAuthentication.post('/authentication/logout', { refreshToken: sessionData.refreshToken })
  } catch (err) {
    console.warn('⚠️ Error al hacer logout en backend:', err)
  } finally {
    clearSession()
  }
}

// Registro de usuario
export const registerUser = (user) => {
  return apiAuthentication.post('/user/register', user)
}

// Buscar usuario
export const searchUserByUsername = (userName) => {
  return apiAuthentication.post('/user/search-by-user-name', { userName })
}

// Recuperar contraseña
export const updateForgotPassword = (userName, password) => {
  return apiAuthentication.put('/user/forgot-password', { userName, password })
}

// =======================
// 🔸 Exportar sesión actual (para el resto del front)
// =======================
export const getSession = () => sessionData

// =======================
// 🔸 Exportar api actual (para el resto del front)
// =======================
export const apiAuth = apiAuthentication

