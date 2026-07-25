// src/services/apiUsuariosService.js
// 🔹 Reemplaza apiEmployeesService.js — usa la tabla de usuarios del micro de autenticación

import { createAxiosWithAuth } from "@/services/axiosWithAuthRefreshToken";

// =======================
// 🔹 Cliente Axios para Usuarios (micro de autenticación)
// =======================
export const apiUsuarios = createAxiosWithAuth(
  process.env.VUE_APP_AUTH_BASE_URL,
);

// =======================
// 📡 ENDPOINTS DE USUARIOS (reemplazan los de empleados)
// =======================

// Listar todos los usuarios
export const listarUsuarios = () => apiUsuarios.get("/usuario/list/all");

// Registrar usuario
export const registrarUsuario = (usuario) =>
  apiUsuarios.post("/usuario/register", usuario);

// Búsqueda por identificación
export const buscarUsuarioPorIdentificacion = (identificacion) =>
  apiUsuarios.get("/usuario/identificacion", { params: { identificacion } });

// Búsqueda por nombres
export const buscarUsuarioPorNombres = (nombres) =>
  apiUsuarios.get("/usuario/nombres", { params: { nombres } });

// Búsqueda por apellidos
export const buscarUsuarioPorApellidos = (apellidos) =>
  apiUsuarios.get("/usuario/apellidos", { params: { apellidos } });

// Búsqueda por userName
export const buscarUsuarioPorUserName = (userName) =>
  apiUsuarios.get("/usuario/userName", { params: { userName } });

// Actualizar usuario
export const actualizarUsuario = (usuario, userLogin) =>
  apiUsuarios.put("/usuario/update", usuario, { params: { userLogin } });

// Eliminar usuario por identificación
export const eliminarUsuarioPorIdentificacion = (identificacion) =>
  apiUsuarios.delete("/usuario/delete", { params: { identificacion } });

// Busqueda por fecha de creacion (rango)
export const buscarUsuarioPorFechaCreacion = (fechaInicio, fechaFin) =>
  apiUsuarios.get("/usuario/fechaCreacion", {
    params: { fechaInicio, fechaFin },
  });
