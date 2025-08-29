// src/services/authService.js

import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // ⚠️ backend
  headers: {
    'Content-Type': 'application/json'
  }
})

export const login = (userName, password) => {
  return apiClient.post('/auth/login', {
    userName,
    password
  })
}

// Se elimina la función de selección de rol
// export const confirmarSeleccion = (data) => {
//   return apiClient.post('/login/role-selection', data)
// }
