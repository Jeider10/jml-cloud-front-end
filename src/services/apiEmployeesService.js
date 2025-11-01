// src/services/apiEmployeesService.js

import axios from 'axios'
import router from '@/router'

const apiEmployees = axios.create({
  baseURL: process.env.VUE_APP_EMPLOYEES_BASE_URL, // URL del backend
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🔐 Interceptor para añadir token en cada request
apiEmployees.interceptors.request.use(config => {
  const token = localStorage.getItem('sessionToken')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ⚠️ Interceptor para manejar respuestas de error
apiEmployees.interceptors.response.use(
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
export const listarEmpleados = () => apiEmployees.get('/empleados/list/all')

// Crear Empleado
export const crearEmpleado = (cliente) => apiEmployees.post('/empleados/register', cliente)

// Búsqueda por identificación
export const buscarEmpleadoPorIdentificacion = (identificacion) => apiEmployees.get('/empleados/identificacion', { params: { identificacion } })

// Búsqueda por nombres
export const buscarEmpleadoPorNombres = (nombres) => apiEmployees.get('/empleados/nombres', { params: { nombres } })

// Búsqueda por apellidos
export const buscarEmpleadoPorApellidos = (apellidos) => apiEmployees.get('/empleados/apellidos', { params: { apellidos } })

// Actualizar Empleado
export const actualizarEmpleado = (cliente) => apiEmployees.put('/empleados/update', cliente)

// Eliminar Empleado
export const eliminarEmpleadoPorIdentificacion = (identificacion) => apiEmployees.delete('/empleados/delete', { params: { identificacion } })

