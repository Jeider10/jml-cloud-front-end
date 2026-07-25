// src/services/apiEmployeesService.js

import { createAxiosWithAuth } from '@/services/axiosWithAuthRefreshToken'

// =======================
// 🔹 Cliente Axios para Employees
// =======================
export const apiEmployees = createAxiosWithAuth(process.env.VUE_APP_EMPLOYEES_BASE_URL)

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

// Busqueda por fecha de creacion (rango)
export const buscarEmpleadoPorFechaCreacion = (fechaInicio, fechaFin) => apiEmployees.get('/empleados/fechaCreacion', { params: { fechaInicio, fechaFin } })
