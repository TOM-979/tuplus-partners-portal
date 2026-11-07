import { useEffect, useState } from 'react'
import './Perfil.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Field from '../../components/Field/Field.jsx'
import Icon from '../../components/Icon/Icon.jsx'
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
  const [perfil, setPerfil] = useState(null)
  const [historial, setHistorial] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, error: '' })

  const [mostrarForm, setMostrarForm] = useState(false)
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [errorClave, setErrorClave] = useState('')
  const [mensajeClave, setMensajeClave] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargar = () => {
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
      setActual(''); setNueva(''); setMostrarForm(false)
    } catch (err) {
      setErrorClave(err instanceof ApiError ? err.message : 'No se pudo cambiar tu contraseña.')
    } finally {
      setGuardando(false)
    }
  }

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando tu perfil…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  const rows = [
    ['Código de Partner', usuario.partner.codigo],
    ['Rango', `${usuario.partner.nivel} · ${NOMBRES_NIVEL[usuario.partner.nivel] || ''}`],
    ['Función territorial', usuario.partner.esLiderRegional ? 'Líder Regional' : 'Ninguna'],
    ['Territorio asignado', usuario.partner.territorio || 'Sin asignar'],
    ['Correo', usuario.correo],
  ]

  return (
    <>
      <PageHeader title="Mi perfil" description="Tus datos internos en la Red. Los cambios de rango y territorio los hace la Dirección, con registro de cada cambio."
        actions={<button type="button" className="btn btn-ghost" onClick={() => setMostrarForm((v) => !v)}>{mostrarForm ? 'Cerrar' : 'Cambiar contraseña'}</button>} />

      {mostrarForm && (
        <form className="card profile-form" onSubmit={guardarClave} noValidate aria-labelledby="cambiar-clave">
          <h2 id="cambiar-clave" className="visually-hidden">Cambiar contraseña</h2>
          <div className="profile-form__fields">
            <Field id="actual" label="Contraseña actual">
              {(a) => <input {...a} type="password" autoComplete="current-password" required value={actual} onChange={(e) => setActual(e.target.value)} />}
            </Field>
            <Field id="nueva" label="Nueva contraseña" hint="Mínimo 8 caracteres">
              {(a) => <input {...a} type="password" autoComplete="new-password" required minLength={8} value={nueva} onChange={(e) => setNueva(e.target.value)} />}
            </Field>
          </div>
          {errorClave && <p className="field__error" role="alert">{errorClave}</p>}
          <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar nueva contraseña'}</button>
        </form>
      )}
      {mensajeClave && <p className="profile-ok" role="status">{mensajeClave}</p>}

      <div className="profile-grid">
        <section className="card" aria-labelledby="identidad">
          <h2 id="identidad">Identificación</h2>
          <dl className="profile-dl">
            {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>

        {perfil?.partner?.siguienteNivel && (
          <section className="card" aria-labelledby="siguiente">
            <h2 id="siguiente">Siguiente nivel</h2>
            <p><Icon name="ladder" size={18} /> {perfil.partner.siguienteNivel.codigo} · {perfil.partner.siguienteNivel.nombre}</p>
            <p className="muted profile-note">El ascenso lo decide la Dirección, evaluando resultados, documentación y conducta.</p>
          </section>
        )}

        <section className="card" aria-labelledby="historial">
          <h2 id="historial">Historial de cambios</h2>
          {historial.length === 0
            ? <Vacio titulo="Todavía no hay cambios registrados" texto="Aquí verás cada vez que cambie tu rango o función." icono="info" />
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
      </div>
    </>
  )
}
