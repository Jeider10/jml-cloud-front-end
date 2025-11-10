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

  instance.interceptors.response.use(
    response => response,
    async (error) => {
      const { response, config } = error

      if ((response && (response.status === 401 || response.status === 403)) && sessionData.refreshToken) {
        console.log('🔑 Token expirado. Intentando refrescar...')

        if (!isRefreshing) {
          isRefreshing = true
          try {
            console.warn('♻️ Intentando refrescar token...')

            const refreshResponse = await refreshToken(sessionData.refreshToken, sessionData.authorization)
            setSession(refreshResponse.data)

            const newAccessToken = refreshResponse.data.authorization
            config.headers['Authorization'] = `Bearer ${newAccessToken}`

            console.log('✅ Token refrescado exitosamente.')

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

      return Promise.reject(error)
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
