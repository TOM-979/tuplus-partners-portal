import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Acceso.css'
import Icon from '../../components/Icon/Icon.jsx'
import Field from '../../components/Field/Field.jsx'
import { useAuth, ApiError } from '../../context/AuthContext.jsx'

const MOTIVOS = {
  vencida: 'Tu sesión venció o no es válida. Vuelve a iniciar sesión.',
  inactividad: 'Cerramos tu sesión por inactividad, para proteger tu cuenta. Vuelve a iniciar sesión.',
}

export default function Acceso() {
  const { iniciarSesion, confirmarCodigo, motivoSalida, limpiarMotivoSalida } = useAuth()
  const navigate = useNavigate()

  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [paso, setPaso] = useState('credenciales') // 'credenciales' | 'codigo'
  const [usuarioId, setUsuarioId] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const entrarConCredenciales = async (e) => {
    e.preventDefault()
    setError(''); setEnviando(true); limpiarMotivoSalida()
    try {
      const r = await iniciarSesion(correo.trim().toLowerCase(), contrasena)
      if (r.requiereCodigo) { setUsuarioId(r.usuarioId); setPaso('codigo') }
      else navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const confirmar = async (e) => {
    e.preventDefault()
    setError(''); setEnviando(true)
    try {
      await confirmarCodigo(usuarioId, codigo.trim())
      navigate('/direccion')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo confirmar el código.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="access">
      <section className="access__intro">
        <h1>Portal TUPLUS Partners</h1>
        <p>El espacio privado de la Red de Socios Comerciales: tu nivel, tus oportunidades y tu formación en un solo lugar.</p>
        <ul className="access__points">
          <li><Icon name="ladder" /> Avanza de nivel por mérito, de L0 a MASTER PARTNER.</li>
          <li><Icon name="briefcase" /> Registra oportunidades y sigue cada una hasta la posventa.</li>
          <li><Icon name="book" /> Capacítate y certifícate en la Academia Comercial.</li>
        </ul>
        <p className="access__apply">¿Todavía no eres Partner? <Link to="/postulacion">Postula a la Red</Link></p>
      </section>

      <section className="card access__card" aria-labelledby="acceso-titulo">
        {motivoSalida && <p className="access__aviso" role="status">{MOTIVOS[motivoSalida]}</p>}

        {paso === 'credenciales' ? (
          <form onSubmit={entrarConCredenciales} noValidate>
            <h2 id="acceso-titulo">Entrar al portal</h2>
            <div className="access__fields">
              <Field id="correo" label="Correo electrónico">
                {(a) => <input {...a} type="email" autoComplete="email" inputMode="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} />}
              </Field>
              <Field id="contrasena" label="Contraseña">
                {(a) => <input {...a} type="password" autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />}
              </Field>
            </div>
            {error && <p className="field__error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary access__submit" disabled={enviando}>
              {enviando ? <Icon name="loader" size={18} /> : null} {enviando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={confirmar} noValidate>
            <h2 id="acceso-titulo">Confirma tu acceso</h2>
            <p className="access__note"><Icon name="mail" size={16} /> Enviamos un código a tu correo. Escríbelo aquí; vence en 10 minutos.</p>
            <Field id="codigo" label="Código de 6 dígitos">
              {(a) => <input {...a} inputMode="numeric" maxLength={6} autoComplete="one-time-code" required value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))} />}
            </Field>
            {error && <p className="field__error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary access__submit" disabled={enviando}>
              {enviando ? <Icon name="loader" size={18} /> : null} {enviando ? 'Confirmando…' : 'Confirmar'}
            </button>
            <button type="button" className="btn btn-ghost access__submit" onClick={() => { setPaso('credenciales'); setCodigo(''); setError('') }}>Volver</button>
          </form>
        )}
      </section>
    </div>
  )
}
