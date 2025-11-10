// src/services/apiAuthService.js

import { sessionData, setSession, clearSession } from '@/services/sessionService'
import { createAxiosWithAuth } from '@/services/axiosWithAuthRefreshToken'

// =======================
// 🔹 Cliente Axios para Autenticación
// =======================
export const apiAuthentication = createAxiosWithAuth(process.env.VUE_APP_AUTH_BASE_URL)

// =======================
// 📡 ENDPOINTS DEL MICROSERVICIO DE AUTHENTICACIÓN
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
//export const refreshToken = (refreshTokenValue, authorizationValue) =>
//  apiAuthentication.post('/authentication/refresh', {
//    refreshToken: refreshTokenValue,
//    authorization: authorizationValue
//  })

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
