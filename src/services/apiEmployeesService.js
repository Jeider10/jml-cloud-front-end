// src/services/apiEmployeesService.js

import axios from 'axios'
import { sessionData, clearSession, setSession } from '@/services/sessionService'
import { refreshToken } from '@/services/apiAuthService'
import router from '@/router'

// =======================
// 🔹 Cliente Axios Employees
// =======================
const apiEmployees = axios.create({
  baseURL: process.env.VUE_APP_EMPLOYEES_BASE_URL, // URL del backend
  headers: { 'Content-Type': 'application/json' }
})

// =======================
// 🔐 Interceptor de Request
// =======================
apiEmployees.interceptors.request.use(config => {
  if (sessionData.accessToken) {
    config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
  }
  return config
})

// =======================
// ⚠️ Interceptor de response con manejo de expiración
// =======================
apiEmployees.interceptors.response.use(
  response => response,
  async error => {
    // 🔁 Intentar refrescar el token si expira
    if (error.response && error.response.status === 401 && sessionData.refreshToken) {
      try {
        console.warn('♻️ Intentando refrescar token...')
        const refreshResponse = await refreshToken(sessionData.refreshToken)
        setSession(refreshResponse.data)
        // Reintenta la petición original con el nuevo token
        error.config.headers['Authorization'] = `Bearer ${sessionData.accessToken}`
        return apiEmployees.request(error.config)
      } catch (refreshError) {
        console.error('❌ Error al refrescar token:', refreshError)
        clearSession()
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

// =======================
// 📡 ENDPOINTS DEL MICROSERVICIO DE EMPLEADOS
// =======================

// Listar todos los empleados
export const listarEmpleados = () => apiEmployees.get('/empleados/list/all')

// Crear empleado
export const crearEmpleado = (empleado) => apiEmployees.post('/empleados/register', empleado)

// Búsqueda por identificación
export const buscarEmpleadoPorIdentificacion = (identificacion) => apiEmployees.get('/empleados/identificacion', { params: { identificacion } })

// Búsqueda por nombres
export const buscarEmpleadoPorNombres = (nombres) => apiEmployees.get('/empleados/nombres', { params: { nombres } })

// Búsqueda por apellidos
export const buscarEmpleadoPorApellidos = (apellidos) => apiEmployees.get('/empleados/apellidos', { params: { apellidos } })

// Actualizar empleado
export const actualizarEmpleado = (empleado) => apiEmployees.put('/empleados/update', empleado)

// Eliminar empleado por identificación
export const eliminarEmpleadoPorIdentificacion = (identificacion) => apiEmployees.delete('/empleados/delete', { params: { identificacion } })
