// src/services/apiEmployeesService.js

import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_EMPLOYEES_BASE_URL, // ⚠️ backend empleados
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

    // Pasamos un Error con mensaje más útil (si viene del backend lo usamos)
    const message = error.response?.data?.message || error.response?.data || error.message || 'Error en la petición'
    return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)))
  }
)

// =======================
// 🔹 Endpoints del microservicio de Empleados
// =======================

// Listar todos los Empleados
export const listarEmpleados = () => apiClient.get('/empleados/listar-todos')

// Crear Empleado
export const crearEmpleado = (cliente) => apiClient.post('/empleados/register', cliente)

// Búsqueda por identificación
export const buscarEmpleadoPorIdentificacion = (identificacion) =>
  apiClient.get('/empleados/identificacion', { params: { identificacion } })

// Búsqueda por nombres
export const buscarEmpleadoPorNombres = (nombres) =>
  apiClient.get('/empleados/nombres', { params: { nombres } })

// Búsqueda por apellidos
export const buscarEmpleadoPorApellidos = (apellidos) =>
  apiClient.get('/empleados/apellidos', { params: { apellidos } })

// Actualizar Empleado
export const actualizarEmpleado = (cliente) => {
  return apiClient.put('/empleados/actualizar', cliente)
}

// Eliminar Empleado
export const eliminarEmpleadoPorIdentificacion = (identificacion) =>
  apiClient.delete('/empleados/eliminar-identificacion', { params: { identificacion } })

