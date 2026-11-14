import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Perfil.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Field from '../../components/Field/Field.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { useAuth, ApiError } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'

const NOMBRES_NIVEL = { L0: 'Postulante', L1: 'Candidato en formación', L2: 'Socio Comercial TUPLUS', L3: 'Consultor B2B TUPLUS', L4: 'Senior Partner TUPLUS', L5: 'MASTER PARTNER TUPLUS', L6: 'Líder Regional TUPLUS' }

const ACCION_TEXTO = {
  activado: 'Activación como Partner',
  cambio_nivel: 'Cambio de rango',
  asignar_lider_regional: 'Asignación de Líder Regional',
  quitar_lider_regional: 'Se quitó la función de Líder Regional',
}

export default function Perfil() {
  const { usuario, cambiarContrasena } = useAuth()
  const esDireccion = usuario.rol === 'direccion'
  const [perfil, setPerfil] = useState(null)
  const [historial, setHistorial] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, error: '' })

  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [errorClave, setErrorClave] = useState('')
  const [mensajeClave, setMensajeClave] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = () => {
    if (esDireccion) { setPerfil({}); setHistorial([]); setEstado({ cargando: false, error: '' }); return }
    setEstado({ cargando: true, error: '' })
    Promise.all([api.get('/perfil'), api.get('/perfil/historial')])
      .then(([p, h]) => { setPerfil(p.dato); setHistorial(h.datos) })
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudo cargar tu perfil.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  const guardarClave = async (e) => {
    e.preventDefault()
    setErrorClave(''); setMensajeClave(''); setGuardando(true)
    try {
      await cambiarContrasena(actual, nueva)
      setMensajeClave('Tu contraseña se cambió correctamente.')
      setActual(''); setNueva('')
    } catch (err) {
      setErrorClave(err instanceof ApiError ? err.message : 'No se pudo cambiar tu contraseña.')
    } finally {
      setGuardando(false)
    }
  }

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando tu perfil…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  const nombre = esDireccion ? 'Dirección Comercial' : usuario.partner.nombre
  const rows = esDireccion ? [
    ['Rol', 'Dirección Comercial'],
    ['Alcance', 'Toda la red: niveles, territorios y Partners'],
    ['Verificación al entrar', 'Código de 6 dígitos por correo'],
    ['Correo', usuario.correo],
  ] : [
    ['Código de Partner', usuario.partner.codigo],
    ['Rango', `${usuario.partner.nivel} · ${NOMBRES_NIVEL[usuario.partner.nivel] || ''}`],
    ['Función territorial', usuario.partner.esLiderRegional ? 'Líder Regional' : 'Ninguna'],
    ['Territorio asignado', usuario.partner.territorio || 'Sin asignar'],
    ['Correo', usuario.correo],
  ]

  const iniciales = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase()
  const hechos = esDireccion ? [
    ['Rol', 'Dirección Comercial'],
    ['Alcance', 'Toda la red'],
    ['Seguridad', 'Doble verificación'],
  ] : [
    ['Rango', usuario.partner.nivel],
    ['Territorio', usuario.partner.territorio || 'Sin asignar'],
    ['Función', usuario.partner.esLiderRegional ? 'Líder Regional' : 'Partner'],
  ]
  const atajos = esDireccion ? [
    { to: '/direccion', icono: 'mail', titulo: 'Revisar postulaciones', texto: 'Decide quién entra a la Red.' },
    { to: '/gestion', icono: 'coin', titulo: 'Comisiones y reportes', texto: 'Aprueba y exporta con respaldo.' },
    { to: '/academia', icono: 'book', titulo: 'Publicar cursos', texto: 'Crea y habilita contenido.' },
  ] : [
    { to: '/crm', icono: 'briefcase', titulo: 'Registrar oportunidad', texto: 'Suma una empresa a tu cartera.' },
    { to: '/academia', icono: 'book', titulo: 'Seguir mi formación', texto: 'Avanza lecciones y evaluaciones.' },
    { to: '/niveles', icono: 'ladder', titulo: 'Ver los niveles', texto: 'Qué se necesita para subir.' },
  ]

  return (
    <>
      <PageHeader title="Mi perfil" description={esDireccion ? 'Los datos de tu cuenta y la seguridad de tu acceso.' : 'Tus datos internos en la Red. Los cambios de rango y territorio los hace la Dirección, con registro de cada cambio.'} />

      {mensajeClave && <p className="profile-ok" role="status">{mensajeClave}</p>}

      <section className="profile-hero" aria-label="Resumen de tu cuenta">
        <div className="profile-hero__who">
          <span className="avatar" aria-hidden="true">{iniciales}</span>
          <div>
            <h2>{nombre}</h2>
            <p>{usuario.correo}</p>
            <Badge tone="gold">{esDireccion ? 'Acceso total' : `${usuario.partner.nivel} · ${NOMBRES_NIVEL[usuario.partner.nivel] || ''} · ${usuario.partner.codigo}`}</Badge>
          </div>
        </div>
        <dl className="profile-hero__facts">
          {hechos.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>

      <div className="profile-grid">
        <section className="card" aria-labelledby="identidad">
          <h2 id="identidad">Identificación</h2>
          <dl className="profile-dl">
            {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>

        <section className="card" aria-labelledby="seguridad">
          <h2 id="seguridad">Seguridad</h2>
          <p className="muted profile-note">Cambia tu contraseña cuando lo necesites. Usa al menos 8 caracteres.</p>
          <form className="profile-form" onSubmit={guardarClave} noValidate>
            <Field id="actual" label="Contraseña actual">
              {(a) => <input {...a} type="password" autoComplete="current-password" required value={actual} onChange={(e) => setActual(e.target.value)} />}
            </Field>
            <Field id="nueva" label="Nueva contraseña" hint="Mínimo 8 caracteres">
              {(a) => <input {...a} type="password" autoComplete="new-password" required minLength={8} value={nueva} onChange={(e) => setNueva(e.target.value)} />}
            </Field>
            {errorClave && <p className="field__error" role="alert">{errorClave}</p>}
            <button type="submit" className="btn btn-primary" disabled={guardando || !actual || nueva.length < 8}>{guardando ? 'Guardando…' : 'Guardar nueva contraseña'}</button>
          </form>
        </section>

        <section className="card" aria-labelledby="atajos">
          <h2 id="atajos">Accesos rápidos</h2>
          <ul className="profile-links">
            {atajos.map((a) => (
              <li key={a.to}>
                <Link to={a.to}>
                  <span className="profile-links__icon"><Icon name={a.icono} size={18} /></span>
                  <span><strong>{a.titulo}</strong><small>{a.texto}</small></span>
                  <Icon name="chevronRight" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {perfil?.partner?.siguienteNivel && (
          <section className="card" aria-labelledby="siguiente">
            <h2 id="siguiente">Siguiente nivel</h2>
            <p className="profile-next"><Icon name="ladder" size={18} /> {perfil.partner.siguienteNivel.codigo} · {perfil.partner.siguienteNivel.nombre}</p>
            <p className="muted profile-note">El ascenso lo decide la Dirección, evaluando resultados, documentación y conducta.</p>
          </section>
        )}

        {!esDireccion && (
          <section className="card profile-wide" aria-labelledby="historial">
            <h2 id="historial">Historial de cambios</h2>
            {historial.length === 0
              ? <Vacio titulo="Todavía no hay cambios registrados" texto="Aquí verás cada vez que cambie tu rango o función." icono="clock" />
              : (
                <ol className="profile-historial">
                  {historial.map((h, i) => (
                    <li key={i}>
                      <strong>{ACCION_TEXTO[h.accion] || h.accion}</strong>
                      {h.valor_anterior && h.valor_nuevo ? `: ${h.valor_anterior} → ${h.valor_nuevo}` : h.valor_nuevo ? `: ${h.valor_nuevo}` : ''}
                      <br /><span className="muted">{new Date(h.creado_en).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' })}{h.motivo ? ` · ${h.motivo}` : ''}</span>
                    </li>
                  ))}
                </ol>
              )}
          </section>
        )}
      </div>
    </>
  )
}
