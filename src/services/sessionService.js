// src/services/sessionService.js

// =======================
// 🔹 Estado de sesión (reactivo simple)
// =======================
export let sessionData = {
  accessToken: null,
  refreshToken: null,
  user: null
}

// =======================
// 🧠 Funciones auxiliares de sesión
// =======================
export const setSession = (data) => {
  sessionData.accessToken = data.authorization
  sessionData.refreshToken = data.refreshToken
  sessionData.user = data.options
}

export const clearSession = () => {
  sessionData.accessToken = null
  sessionData.refreshToken = null
  sessionData.user = null
}
