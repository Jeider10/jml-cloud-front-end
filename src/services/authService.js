// src/services/authService.js

import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // ⚠️ backend
  headers: {
    'Content-Type': 'application/json'
  }
})

// Login
export const login = (userName, password) => {
  return apiClient.post('/auth/login', {
    userName,
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
