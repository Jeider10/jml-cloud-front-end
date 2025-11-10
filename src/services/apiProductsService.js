// src/services/apiProductsService.js

import { createAxiosWithAuth } from '@/services/axiosWithAuthRefreshToken'

// =======================
// 🔹 Cliente Axios para Products
// =======================
export const apiProducts = createAxiosWithAuth(process.env.VUE_APP_PRODUCTS_BASE_URL)

// =======================
// 📡 ENDPOINTS DEL MICROSERVICIO DE PRODUCTOS
// =======================

// Listar todos los productos
export const listarProductos = () => apiProducts.get('/productos/list/all')

// Crear producto
export const crearProducto = (producto) => apiProducts.post('/productos/register', producto)

// Búsqueda por código
export const buscarProductoPorCodigo = (codigo) => apiProducts.get('/productos/codigo', { params: { codigo } })

// Búsqueda por nombre
export const buscarProductoPorNombre = (nombre) => apiProducts.get('/productos/nombre', { params: { nombre } })

// Búsqueda por descripción
export const buscarProductoPorDescripcion = (descripcion) => apiProducts.get('/productos/descripcion', { params: { descripcion } })

// Búsqueda por cantidad
export const buscarProductoPorCantidad = (cantidad) => apiProducts.get('/productos/cantidad', { params: { cantidad } })

// Búsqueda por precio
export const buscarProductoPorPrecio = (precio) => apiProducts.get('/productos/precio', { params: { precio } })

// Búsqueda por proveedor (id)
export const buscarProductoPorProveedorId = (proveedorId) => apiProducts.get('/productos/proveedorId', { params: { proveedorId } })

// Búsqueda por proveedor (nombre)
export const buscarProductoPorProveedorName = (proveedorName) => apiProducts.get('/productos/proveedorName', { params: { proveedorName } })

// Actualizar producto
export const actualizarProducto = (producto) => apiProducts.put('/productos/update', producto)

// Eliminar producto por código
export const eliminarProductoPorCodigo = (codigo) => apiProducts.delete('/productos/delete', { params: { codigo } })

// Restar stock de un producto por código
export const restarStockProducto = (codigo, cantidad) => apiProducts.put(`/productos/restar-stock/${codigo}`, null, { params: { cantidad } })

// Búsqueda por fecha de creación
export const buscarProductoPorFechaCreacion = (fechaCreacion) => apiProducts.get('/productos/fechaCreacion', { params: { fechaCreacion } })
