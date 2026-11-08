import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Acceso.css'
import Icon from '../../components/Icon/Icon.jsx'
import Field from '../../components/Field/Field.jsx'
import Logo from '../../components/Logo/Logo.jsx'
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
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
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
        <div className="access__brand">
          <span className="access__brand-icon"><Logo height={16} /></span>
          <span>TUPLUS <span className="access__brand-accent">Partners</span></span>
        </div>
        <div className="access__story">
        <h1>El espacio privado de la Red de Socios Comerciales.</h1>
        <ul className="access__points">
          <li><span className="access__benefit-icon"><Icon name="ladder" size={22} /></span><div><h2>Crece por mérito</h2><p>Avanza de nivel por mérito, de L0 a MASTER PARTNER.</p></div></li>
          <li><span className="access__benefit-icon"><Icon name="briefcase" size={22} /></span><div><h2>Gestiona tus oportunidades</h2><p>Registra oportunidades y sigue cada una hasta la posventa.</p></div></li>
          <li><span className="access__benefit-icon"><Icon name="book" size={22} /></span><div><h2>Aprende y certifícate</h2><p>Capacítate y certifícate en la Academia Comercial.</p></div></li>
        </ul>
        </div>
        <p className="access__footer">TUPLUS Partners · Portal privado</p>
      </section>

      <section className="access__form-panel" aria-labelledby="acceso-titulo">
        <div className="access__card">
        {motivoSalida && <p className="access__aviso" role="status">{MOTIVOS[motivoSalida]}</p>}

        {paso === 'credenciales' ? (
          <form onSubmit={entrarConCredenciales} noValidate>
            <div className="access__heading">
              <h2 id="acceso-titulo">Inicia sesión</h2>
              <p>Usa tu correo y contraseña de Partner.</p>
            </div>
            <div className="access__fields">
              <Field id="correo" label="Correo electrónico">
                {(a) => <input {...a} type="email" autoComplete="email" inputMode="email" placeholder="nombre@tuplus.pe" required value={correo} onChange={(e) => setCorreo(e.target.value)} />}
              </Field>
              <Field id="contrasena" label="Contraseña">
                {(a) => <div className="access__password">
                  <input {...a} type={mostrarContrasena ? 'text' : 'password'} autoComplete="current-password" required value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
                  <button type="button" className="access__password-toggle" aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={mostrarContrasena} aria-controls="contrasena" onClick={() => setMostrarContrasena((v) => !v)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
                      {mostrarContrasena && <path d="m3 3 18 18" />}
                    </svg>
                  </button>
                </div>}
              </Field>
            </div>
            {error && <p className="field__error" role="alert">{error}</p>}
            <button type="submit" className="btn btn-primary access__submit" disabled={enviando}>
              {enviando ? <Icon name="loader" size={18} /> : null} {enviando ? 'Entrando…' : 'Entrar'}
              {!enviando && <span className="access__arrow" aria-hidden="true">→</span>}
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
        <p className="access__apply">¿Todavía no eres Partner? <Link to="/postulacion">Postula a la Red</Link></p>
        </div>
      </section>
    </div>
  )
}
