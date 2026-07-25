// src/services/apiCustomerService.js

import { createAxiosWithAuth } from '@/services/axiosWithAuthRefreshToken'

// =======================
// 🔹 Cliente Axios Customer
// =======================
export const apiCustomer = createAxiosWithAuth(process.env.VUE_APP_CUSTOMER_BASE_URL)

// =======================
// 📡 ENDPOINTS DEL MICROSERVICIO DE CLIENTES
// =======================

// Listar todos los clientes
export const listarClientes = () => apiCustomer.get('/clientes/list/all')

// Crear cliente
export const crearCliente = (cliente) => apiCustomer.post('/clientes/register', cliente)

// Búsqueda por identificación
export const buscarClientePorIdentificacion = (identificacion) => apiCustomer.get('/clientes/identificacion', { params: { identificacion } })

// Búsqueda por nombres
export const buscarClientePorNombres = (nombres) => apiCustomer.get('/clientes/nombres', { params: { nombres } })

// Búsqueda por apellidos
export const buscarClientePorApellidos = (apellidos) => apiCustomer.get('/clientes/apellidos', { params: { apellidos } })

// Actualizar cliente
export const actualizarCliente = (cliente) => apiCustomer.put('/clientes/update', cliente)

// Eliminar cliente por identificación
export const eliminarClientePorIdentificacion = (identificacion) => apiCustomer.delete('/clientes/delete', { params: { identificacion } })

// Busqueda por fecha de creacion (rango)
export const buscarClientePorFechaCreacion = (fechaInicio, fechaFin) => apiCustomer.get('/clientes/fechaCreacion', { params: { fechaInicio, fechaFin } })

// Búsqueda por dirección
export const buscarClientePorDireccion = (direccion) => apiCustomer.get('/clientes/direccion', { params: { direccion } })
