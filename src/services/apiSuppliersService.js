// src/services/apiSuppliersService.js

import { createAxiosWithAuth } from "@/services/axiosWithAuthRefreshToken";

// =======================
// 🔹 Cliente Axios para Suppliers
// =======================
export const apiSuppliers = createAxiosWithAuth(
  process.env.VUE_APP_SUPPLIERS_BASE_URL,
);

// =======================
// 📡 ENDPOINTS DEL MICROSERVICIO DE PROVEEDORES
// =======================

// Listar todos los proveedores
export const listarProveedores = () =>
  apiSuppliers.get("/proveedores/list/all");

// Crear proveedor
export const crearProveedor = (proveedor) =>
  apiSuppliers.post("/proveedores/register", proveedor);

// Búsqueda por código de sucursal
export const buscarProveedorPorCodigoSucursal = (codigoSucursal) =>
  apiSuppliers.get("/proveedores/codigoSucursal", {
    params: { codigoSucursal },
  });

// Búsqueda por nombre
export const buscarProveedorPorNombre = (nombre) =>
  apiSuppliers.get("/proveedores/nombre", { params: { nombre } });

// Actualizar proveedor
export const actualizarProveedor = (proveedor) =>
  apiSuppliers.put("/proveedores/update", proveedor);

// Eliminar proveedor por código de sucursal
export const eliminarProveedorPorCodigoSucursal = (codigoSucursal) =>
  apiSuppliers.delete("/proveedores/delete", { params: { codigoSucursal } });

// Busqueda por fecha de creacion (rango)
export const buscarProveedorPorFechaCreacion = (fechaInicio, fechaFin) =>
  apiSuppliers.get("/proveedores/fechaCreacion", {
    params: { fechaInicio, fechaFin },
  });
