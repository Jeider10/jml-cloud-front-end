// src/services/sessionService.js

// =======================
// 🔹 Estado de sesión (reactivo simple)
// =======================

// Clave usada en sessionStorage
const SESSION_KEY = 'sessionData'

// Crea el objeto por defecto
const defaultSession = {
  accessToken: null,
  refreshToken: null,
  user: null
}

// =======================
// 🔹 Cargar sesión desde sessionStorage (si existe)
// =======================
function loadSessionFromStorage() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return { ...defaultSession }
    const parsed = JSON.parse(raw)
    // garantizar que tenga las claves esperadas
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null
    }
  } catch (e) {
    // Si algo falla en el parseo, limpiamos y retornamos por defecto
    console.warn('⚠️ No se pudo parsear sessionStorage, inicializando sesión por defecto.', e)
    sessionStorage.removeItem(SESSION_KEY)
    return { ...defaultSession }
  }
}

// =======================
// 🔹 Estado en memoria (se exporta para compatibilidad con el resto del código)
// =======================
export let sessionData = loadSessionFromStorage()

// =======================
// 🧠 Funciones auxiliares de sesión
// =======================

// setSession acepta el DTO que envía el backend (con fields: authorization, refreshToken, options)
export const setSession = (data) => {
  // Mantener compatibilidad con el formato que ya usas en el front
  // data: { authorization, refreshToken, options }
  sessionData.accessToken = data?.authorization ?? null
  sessionData.refreshToken = data?.refreshToken ?? null
  sessionData.user = data?.options ?? null

  // Persistir en sessionStorage como objeto simple
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      accessToken: sessionData.accessToken,
      refreshToken: sessionData.refreshToken,
      user: sessionData.user
    }))
  } catch (e) {
    console.warn('⚠️ No se pudo guardar sessionData en sessionStorage.', e)
  }
}

export const clearSession = () => {
  sessionData.accessToken = null
  sessionData.refreshToken = null
  sessionData.user = null

  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch (e) {
    console.warn('⚠️ No se pudo eliminar sessionData de sessionStorage.', e)
  }
}
