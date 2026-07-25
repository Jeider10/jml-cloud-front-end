// src/services/apiProductsService.js

import { createAxiosWithAuth } from "@/services/axiosWithAuthRefreshToken";

// =======================
// 🔹 Cliente Axios para Products
// =======================
export const apiProducts = createAxiosWithAuth(
  process.env.VUE_APP_PRODUCTS_BASE_URL,
);

// =======================
// 📡 ENDPOINTS DEL MICROSERVICIO DE PRODUCTOS
// =======================

// Listar todos los productos
export const listarProductos = () => apiProducts.get("/productos/list/all");

// Crear producto
export const crearProducto = (producto) =>
  apiProducts.post("/productos/register", producto);

// Búsqueda por código
export const buscarProductoPorCodigo = (codigo) =>
  apiProducts.get("/productos/codigo", { params: { codigo } });

// Búsqueda por nombre
export const buscarProductoPorNombre = (nombre) =>
  apiProducts.get("/productos/nombre", { params: { nombre } });

// Búsqueda por marca
export const buscarProductoPorMarca = (marca) =>
  apiProducts.get("/productos/marca", { params: { marca } });

// Búsqueda por descripción
export const buscarProductoPorDescripcion = (descripcion) =>
  apiProducts.get("/productos/descripcion", { params: { descripcion } });

// Búsqueda por referencia
export const buscarProductoPorReferencia = (referencia) =>
  apiProducts.get("/productos/referencia", { params: { referencia } });

// Búsqueda por unidad de medida
export const buscarProductoPorUnidadDeMedida = (unidadMedida) =>
  apiProducts.get("/productos/unidadMedida", { params: { unidadMedida } });

// Búsqueda por cantidad
export const buscarProductoPorCantidad = (cantidad) =>
  apiProducts.get("/productos/cantidad", { params: { cantidad } });

// Búsqueda por precio
export const buscarProductoPorPrecio = (precio) =>
  apiProducts.get("/productos/precio", { params: { precio } });

// Búsqueda por proveedor (id)
export const buscarProductoPorProveedorId = (proveedorId) =>
  apiProducts.get("/productos/proveedorId", { params: { proveedorId } });

// Búsqueda por proveedor (nombre)
export const buscarProductoPorProveedorName = (proveedorName) =>
  apiProducts.get("/productos/proveedorName", { params: { proveedorName } });

// Actualizar producto
export const actualizarProducto = (producto) =>
  apiProducts.put("/productos/update", producto);

// Eliminar producto por código
export const eliminarProductoPorCodigo = (codigo) =>
  apiProducts.delete("/productos/delete", { params: { codigo } });

// Restar stock de un producto por código
export const restarStockProducto = (codigo, cantidad) =>
  apiProducts.put(`/productos/restar-stock/${codigo}`, null, {
    params: { cantidad },
  });

// Busqueda por fecha de creacion (rango)
export const buscarProductoPorFechaCreacion = (fechaInicio, fechaFin) =>
  apiProducts.get("/productos/fechaCreacion", {
    params: { fechaInicio, fechaFin },
  });
