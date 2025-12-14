// src/services/axiosWithAuthRefreshToken.js

import axios from 'axios'
import router from '@/router'
import { sessionData, setSession, clearSession } from '@/services/sessionService'
//import { refreshToken } from '@/services/apiAuthService'

export const createAxiosWithAuth = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
  })

  // Interceptor de Request
  instance.interceptors.request.use(config => {
    if (sessionData.accessToken) {
      config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
    }
    return config
  })

  // Interceptor de Response
  let isRefreshing = false
  let refreshAttempts = 0 // 🔹 Contador global de intentos de refresh

  instance.interceptors.response.use(
    response => response,
    async (error) => {
      const { response, config } = error

      // ⚠️ Si no hay respuesta (network error, CORS, etc.)
      if (!response) {
        console.error('🚫 Error sin respuesta del servidor:', error)
        throw error;
      }

      // 🔹 Solo intentar refrescar si es 401 y hay refresh token
      if (response.status === 401 && sessionData?.refreshToken) {
        console.warn('🔑 Token expirado. Intentando refrescar...')

        // ⚠️ Evitar bucles infinitos
        if (refreshAttempts >= 1) {
          console.error('🚫 Se ha intentado refrescar el token más de una vez. Abortando.')
          clearSession()
          router.push('/login')
          throw error;
        }

        if (!isRefreshing) {
          isRefreshing = true
          refreshAttempts++

          try {
            console.warn('♻️ Intentando refrescar token...')

            const refreshResponse = await refreshToken(sessionData.refreshToken, sessionData.authorization)
            setSession(refreshResponse.data)

            const newAccessToken = refreshResponse.data.authorization
            config.headers['Authorization'] = `Bearer ${newAccessToken}`

            console.log('✅ Token refrescado exitosamente.')

            // 🔹 Reintentamos la petición original con el nuevo token
            return instance.request(config)
          } catch (refreshError) {
            console.error('❌ Error al refrescar token:', refreshError)
            clearSession()
            router.push('/login')
          } finally {
            isRefreshing = false
          }
        }
      }

      throw error;
    }
  )

  return instance
}

// Refresh token
//export const refreshToken = (refreshTokenValue, authorizationValue) =>
//  axios.post('/authentication/refresh', {
//    refreshToken: refreshTokenValue,
//    authorization: authorizationValue
//  })

export const refreshToken = (refreshTokenValue, authorizationValue) =>
  axios.post(`${process.env.VUE_APP_AUTH_BASE_URL}/authentication/refresh`, {
    refreshToken: refreshTokenValue,
    authorization: authorizationValue
  })
