// src/services/apiConfigEmpresaUsuariosService.js

import { apiAuth as apiConfigEmpresaUsuario } from "@/services/apiAuthService";

// ===============================
// 📡 ENDPOINTS PARA USUARIOS
// ===============================

// Listar todos los usuarios
export const listarUsuarios = () =>
  apiConfigEmpresaUsuario.get("/usuario/list/all");

// Registrar usuario
export const registrarUsuario = (usuario) =>
  apiConfigEmpresaUsuario.post("/usuario/register", usuario);

// Búsqueda de usuario por identificación
export const buscarUsuarioPorIdentificacion = (identificacion) =>
  apiConfigEmpresaUsuario.get("/usuario/identificacion", {
    params: { identificacion },
  });

// Buscar por userName
export const buscarUsuarioPorUserName = (userName) =>
  apiConfigEmpresaUsuario.get("/usuario/userName", { params: { userName } });

// Buscar por nombres
export const buscarUsuarioPorNombres = (nombres) =>
  apiConfigEmpresaUsuario.get("/usuario/nombres", { params: { nombres } });

// Buscar por apellidos
export const buscarUsuarioPorApellidos = (apellidos) =>
  apiConfigEmpresaUsuario.get("/usuario/apellidos", { params: { apellidos } });

// Buscar por roleName
export const buscarUsuarioPorRoleName = (roleName) =>
  apiConfigEmpresaUsuario.get("/usuario/roleName", { params: { roleName } });

// Actualizar usuario
export const actualizarUsuario = (usuario, userLogin) =>
  apiConfigEmpresaUsuario.put("/usuario/update", usuario, {
    params: { userLogin },
  });

// Eliminar usuario
export const eliminarUsuario = (identificacion) =>
  apiConfigEmpresaUsuario.delete("/usuario/delete", {
    params: { identificacion },
  });

// Buscar usuario por login
export const buscarUsuarioPorLogin = (login) =>
  apiConfigEmpresaUsuario.get(`/usuario/login?userName=${login}`);

// Busqueda por fecha de creacion (rango)
export const buscarUsuarioPorFechaCreacion = (fechaInicio, fechaFin) =>
  apiConfigEmpresaUsuario.get("/usuario/fechaCreacion", {
    params: { fechaInicio, fechaFin },
  });
