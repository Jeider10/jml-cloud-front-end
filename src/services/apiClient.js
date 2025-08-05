<!-- src/services/apiClient.js -->

import axios from 'axios'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8081', // Cambia el puerto si tu backend está en otro
  headers: {
    'Content-Type': 'application/json'
  }
})

export default apiClient
