// src/services/apiConfigEmpresaRolesService.js

import { apiAuth as apiConfigEmpresaRole } from '@/services/apiAuthService'

// ===============================
// 📡 ENDPOINTS PARA ROLES
// ===============================

// Listar todos los roles
export const listarRoles = () => apiConfigEmpresaRole.get('/roles/list/all')

// Registrar rol
export const registrarRole = (role) => apiConfigEmpresaRole.post('/roles/register', role)

// Búsqueda de rol por código
export const buscarRolePorRoleCode = (roleCode) => apiConfigEmpresaRole.get('/roles/roleCode', { params: { roleCode } })

// Buscar por nombre de rol
export const buscarRolePorRoleName = (roleName) => apiConfigEmpresaRole.get('/roles/roleName', { params: { roleName } })

// Actualizar rol
export const actualizarRole = (role) => apiConfigEmpresaRole.put('/roles/update', role)

// Eliminar rol
export const eliminarRole = (roleCode) => apiConfigEmpresaRole.delete('/roles/delete', { params: { roleCode } })
