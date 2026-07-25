// src/services/apiConfigEmpresaService.js

import { apiAuth as apiConfigEmpresa } from "@/services/apiAuthService";

// ==============================
// 🔹 Endpoints del microservicio Empresa
// ==============================

// Obtener la primera empresa (si existe)
export const obtenerPrimeraEmpresa = () => apiConfigEmpresa.get("/empresa");

// Obtener empresa por nit
export const obtenerEmpresa = (nit) => apiConfigEmpresa.get(`/empresa/${nit}`);

// Registrar nueva empresa (usa multipart/form-data)
export const registrarEmpresa = (empresa, file) => {
  const formData = new FormData();
  formData.append(
    "empresa",
    new Blob([JSON.stringify(empresa)], { type: "application/json" }),
  );
  if (file) {
    formData.append("file", file);
  }

  return apiConfigEmpresa.post("/empresa/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Actualizar datos de la empresa (usa multipart/form-data)
export const actualizarEmpresa = (empresa, file) => {
  const formData = new FormData();
  formData.append(
    "empresa",
    new Blob([JSON.stringify(empresa)], { type: "application/json" }),
  );
  if (file) {
    formData.append("file", file);
  }

  return apiConfigEmpresa.put("/empresa/update", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Eliminar empresa por NIT
export const eliminarEmpresa = (nit) =>
  apiConfigEmpresa.delete("/empresa/delete", { params: { nit } });
