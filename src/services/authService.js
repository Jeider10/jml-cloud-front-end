// src/services/authService.js

import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_AUTH_BASE_URL, // ⚠️ backend
  headers: {
    'Content-Type': 'application/json'
  }
})

export const login = (userName, password) => {
  return apiClient.post('/login', {
  userName,
  password })
}

export const confirmarSeleccion = (data) => {
  return apiClient.post('/login/role-selection', data)
}
