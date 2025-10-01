// src/services/authService.js

import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // ⚠️ backend autenticacion
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token en cada request
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor para manejar respuestas de error
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // ❌ Token expirado o inválido
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('authUsername')

      // 🔄 Redirigir al login
      router.push('/login')

      // Opcional: mostrar mensaje en consola
      console.warn('⚠️ Sesión expirada. Por favor inicia sesión nuevamente.')
    }

    // 👇 Devolver siempre un Error válido
    return Promise.reject(
      error instanceof Error ? error : new Error(error.message || 'Error en la petición')
    )
  }
)

// =======================
// 🔹 Endpoints de autenticación
// =======================

// Login
export const login = (usuario, password) => {
  return apiClient.post('/authentication/login', {
    usuario,
    password
  })
}

// Registro de usuario
export const registerUser = (user) => {
  // user = { userName, password, rolCode, email }
  return apiClient.post('/user/register', user)
}

// Validar que el usuario exista
export const searchUserByUsername = (userName) => {
  return apiClient.post('/user/search-by-user-name', { userName })
}

// Recuperación de contraseña
export const updateForgotPassword = (userName, password) => {
  return apiClient.put('/user/forgot-password', { userName, password })
}

// Se elimina la función de selección de rol
// export const confirmarSeleccion = (data) => {
//   return apiClient.post('/login/role-selection', data)
// }
