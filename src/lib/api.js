// Cliente de la API del Portal. Agrega el token de sesión, y si una respuesta dice
// que la sesión no es válida (401), avisa a toda la app para cerrar sesión sola.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'tuplus-portal-token'

export const token = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (valor) => { try { valor ? localStorage.setItem(TOKEN_KEY, valor) : localStorage.removeItem(TOKEN_KEY) } catch { /* sin almacenamiento */ } },
}

export class ApiError extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje)
    this.status = status
    this.detalles = detalles
  }
}

async function solicitar(ruta, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token.get()
  if (auth && t) headers.Authorization = `Bearer ${t}`

  let respuesta
  try {
    respuesta = await fetch(`${BASE}${ruta}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.')
  }

  let datos = null
  try { datos = await respuesta.json() } catch { /* respuesta sin cuerpo */ }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && auth) {
      window.dispatchEvent(new CustomEvent('tuplus:sesion-vencida'))
    }
    throw new ApiError(respuesta.status, datos?.error || 'Ocurrió un error inesperado.', datos?.detalles)
  }
  return datos
}

export const api = {
  get: (ruta, opciones) => solicitar(ruta, { ...opciones, method: 'GET' }),
  post: (ruta, body, opciones) => solicitar(ruta, { ...opciones, method: 'POST', body }),
  patch: (ruta, body, opciones) => solicitar(ruta, { ...opciones, method: 'PATCH', body }),
  del: (ruta, opciones) => solicitar(ruta, { ...opciones, method: 'DELETE' }),
}
