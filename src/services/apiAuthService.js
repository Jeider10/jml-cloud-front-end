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
let isRefreshing = false // flag global para evitar múltiples refresh simultáneos
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

apiAuthentication.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response && error.response.status === 401 && sessionData.refreshToken && !originalRequest._retry) {
      if (isRefreshing) {
        // 🕐 Si ya hay un refresh en curso, encolar la petición y esperar
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return apiAuthentication.request(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        console.warn('♻️ Intentando refrescar token...')

        const refreshResponse = await refreshToken(sessionData.refreshToken, sessionData.authorization)

        setSession(refreshResponse.data)
        const newAccessToken = refreshResponse.data.authorization

        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken
        processQueue(null, newAccessToken)
        return apiAuthentication.request(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        console.error('❌ Error al refrescar token:', refreshError)

        // ⚠️ Evitar ciclo infinito: limpiar sesión y redirigir
        await logoutBackend()
        clearSession()
        router.push('/login')

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
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
export const obtenerUsuarioActual = async (token) =>
  apiAuthentication.get('/authentication/obtener-usuario-actual', {
    headers: {
      refreshToken: token
    }
  })

// Refresh token
export const refreshToken = (refreshTokenValue, authorizationValue) => {
  return apiAuthentication.post('/authentication/refresh', {
    refreshToken: refreshTokenValue,
    authorization: authorizationValue
  })
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
// 🔸 Exportar logout actual (para el resto del front)
// =======================
export const getLogout = () => logoutBackend

// =======================
// 🔸 Exportar api actual (para el resto del front)
// =======================
export const apiAuth = apiAuthentication
