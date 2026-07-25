// src/services/axiosWithAuthRefreshToken.js

import axios from 'axios'
import router from '@/router'
import { sessionData, setSession, clearSession } from '@/services/sessionService'
//import { refreshToken } from '@/services/apiAuthService'

export const createAxiosWithAuth = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 30000, // 30 segundos timeout
    headers: { 'Content-Type': 'application/json' }
  })

  // Interceptor de Request
  instance.interceptors.request.use(config => {
    if (sessionData.accessToken) {
      config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
    }
    return config
  })

  // Interceptor de Response con cola de peticiones pendientes
  let isRefreshing = false
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

  instance.interceptors.response.use(
      response => {
        return response
      },
      async (error) => {
        const { response, config } = error

        // Si no hay respuesta (network error, CORS, etc.)
        if (!response) {
          console.error('Error sin respuesta del servidor:', error)
          throw error
        }

        // Solo intentar refrescar si es 401, hay refresh token y no es un retry
        if (response.status === 401 && sessionData?.refreshToken && !config._retry) {
          config._retry = true

          if (isRefreshing) {
            // Si ya se esta refrescando, encolar esta peticion
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then(token => {
              config.headers['Authorization'] = `Bearer ${token}`
              return instance.request(config)
            }).catch(err => {
              throw err
            })
          }

          isRefreshing = true

          try {
            const refreshResponse = await refreshToken(sessionData.refreshToken, sessionData.authorization)
            setSession(refreshResponse.data)

            const newToken = sessionData.accessToken

            // Procesar cola de peticiones pendientes con el nuevo token
            processQueue(null, newToken)

            // Reintentar la peticion original con el nuevo token
            config.headers['Authorization'] = `Bearer ${newToken}`
            return instance.request(config)
          } catch (refreshError) {
            console.error('Error al refrescar token:', refreshError)
            processQueue(refreshError, null)
            clearSession()
            router.push('/login')
            throw refreshError
          } finally {
            isRefreshing = false
          }
        }

        throw error
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
