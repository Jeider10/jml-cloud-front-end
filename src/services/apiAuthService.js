// src/services/apiAuthService.js

import axios from 'axios'
import router from '@/router'
import { sessionData, setSession, clearSession } from '@/services/sessionService'

// =======================
// 🔹 Cliente Axios para Autenticación
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
// ⚠️ Interceptor de Response con manejo de expiración
// =======================
let isRefreshing = false // Flag global para evitar múltiples refresh simultáneos

apiAuthentication.interceptors.response.use(
  response => response,
  async error => {
    // 🔁 Intentar refrescar el token si expira
    if (error.response && error.response.status === 401 && sessionData.refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true
        try {
          console.warn('♻️ Intentando refrescar token...')

          // Enviar ambos tokens al endpoint de refresh
          const refreshResponse = await refreshToken(sessionData.refreshToken, sessionData.authorization)

          setSession(refreshResponse.data)

          // Reemplazar token en la solicitud original
          const newAccessToken = refreshResponse.data.authorization
          error.config.headers['Authorization'] = `Bearer ${newAccessToken}`

          // Reintentar la petición original
          return apiAuthentication.request(error.config)
        } catch (refreshError) {
          console.error('❌ Error al refrescar token:', refreshError)

          // Evitar ciclo infinito: limpiar sesión y redirigir
          await logoutBackend()
          clearSession()
          router.push('/login')
        } finally {
          isRefreshing = false
        }
      }
    }

    return Promise.reject(error)
  }
)

// =======================
// 🔹 Endpoints de Autenticación
// =======================

// Login
export const login = async (usuario, password) => {
  const response = await apiAuthentication.post('/authentication/login', { usuario, password })
  setSession(response.data)
  return response
}

// Obtener usuario actual (usando token activo)
export const obtenerUsuarioActual = async (token) =>
  apiAuthentication.get('/authentication/obtener-usuario-actual', {
    headers: { refreshToken: token }
  })

// Refresh token
export const refreshToken = (refreshTokenValue, authorizationValue) =>
  apiAuthentication.post('/authentication/refresh', {
    refreshToken: refreshTokenValue,
    authorization: authorizationValue
  })

// Logout
export const logoutBackend = async () => {
  if (!sessionData.refreshToken) return

  try {
    await apiAuthentication.post('/authentication/logout', { refreshToken: sessionData.refreshToken })
    console.info('✅ Logout exitoso en backend')
  } catch (err) {
    console.warn('⚠️ Error al hacer logout en backend:', err)
  } finally {
    clearSession()
  }
}

// Registro de usuario
export const registerUser = (user) => apiAuthentication.post('/user/register', user)

// Buscar usuario
export const searchUserByUsername = (userName) =>
  apiAuthentication.post('/user/search-by-user-name', { userName })

// Recuperar contraseña
export const updateForgotPassword = (userName, password) =>
  apiAuthentication.put('/user/forgot-password', { userName, password })

// =======================
// 🔸 Exportaciones de Autenticación para el resto del frontend
// =======================
export const getSession = () => sessionData
export const getLogout = () => logoutBackend
export const apiAuth = apiAuthentication
