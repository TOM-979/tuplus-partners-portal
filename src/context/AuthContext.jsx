import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { api, token, ApiError } from '../lib/api.js'

const AuthContext = createContext(null)
const INACTIVIDAD_MIN = Number(import.meta.env.VITE_INACTIVIDAD_MINUTOS) || 30

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [motivoSalida, setMotivoSalida] = useState(null) // "vencida" | "inactividad" | null
  const inactividadRef = useRef(null)

  const salir = useCallback((motivo = null) => {
    token.set(null)
    setUsuario(null)
    if (motivo) setMotivoSalida(motivo)
  }, [])

  // Carga la sesión al abrir el portal, si ya había un token guardado
  useEffect(() => {
    const t = token.get()
    if (!t) { setCargando(false); return }
    api.get('/auth/yo')
      .then((r) => setUsuario(r.dato))
      .catch(() => token.set(null))
      .finally(() => setCargando(false))
  }, [])

  // Si cualquier llamada a la API recibe un 401, la sesión ya no es válida
  useEffect(() => {
    const onVencida = () => salir('vencida')
    window.addEventListener('tuplus:sesion-vencida', onVencida)
    return () => window.removeEventListener('tuplus:sesion-vencida', onVencida)
  }, [salir])

  // Cierre por inactividad: se reinicia el reloj con cualquier actividad del usuario
  useEffect(() => {
    if (!usuario) return
    const reiniciar = () => {
      clearTimeout(inactividadRef.current)
      inactividadRef.current = setTimeout(() => salir('inactividad'), INACTIVIDAD_MIN * 60 * 1000)
    }
    reiniciar()
    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart']
    eventos.forEach((e) => window.addEventListener(e, reiniciar))
    return () => { clearTimeout(inactividadRef.current); eventos.forEach((e) => window.removeEventListener(e, reiniciar)) }
  }, [usuario, salir])

  const iniciarSesion = async (correo, contrasena) => {
    const r = await api.post('/auth/login', { correo, contrasena }, { auth: false })
    if (r.requiereCodigo) return { requiereCodigo: true, usuarioId: r.usuarioId }
    token.set(r.token)
    setUsuario(r.usuario)
    setMotivoSalida(null)
    return { requiereCodigo: false }
  }

  const confirmarCodigo = async (usuarioId, codigo) => {
    const r = await api.post('/auth/codigo', { usuarioId, codigo }, { auth: false })
    token.set(r.token)
    setUsuario(r.usuario)
    setMotivoSalida(null)
  }

  const cambiarContrasena = (actual, nueva) => api.patch('/auth/contrasena', { actual, nueva })

  const limpiarMotivoSalida = () => setMotivoSalida(null)

  return (
    <AuthContext.Provider value={{ usuario, cargando, motivoSalida, iniciarSesion, confirmarCodigo, cambiarContrasena, salir, limpiarMotivoSalida }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// Reexportado para que las páginas distingan un error de la API de uno de red/inesperado
export { ApiError }
