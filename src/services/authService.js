// src/services/authService.js
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:8081/auth', // ⚠️ backend
  headers: {
    'Content-Type': 'application/json'
  }
})

export const login = (userName, password) => {
  return apiClient.post('/login', {
    userName, // 👈 NO username
    password
  })
}
