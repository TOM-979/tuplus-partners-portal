import { useEffect, useState } from 'react'
import './Direccion.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { useAuth, ApiError } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'

const TERRITORIO_ESTADO = {
  abierta: { label: 'Convocatoria abierta', tone: 'ok' },
  revision: { label: 'Revisión en curso', tone: 'info' },
  proximamente: { label: 'Próximamente', tone: 'warn' },
  cerrada: { label: 'Convocatoria cerrada', tone: 'neutral' },
  activa: { label: 'Operación activa', tone: 'gold' },
}
const POSTULACION_ESTADO = {
  recibida: { label: 'Postulación recibida', tone: 'info' },
  preseleccionado: { label: 'Preseleccionado', tone: 'ok' },
  aclaracion: { label: 'Aclaración pedida', tone: 'warn' },
  no_seleccionado: { label: 'No seleccionado', tone: 'neutral' },
  aprobado: { label: 'Activado como Partner', tone: 'gold' },
}
const decisiones = [
  { estado: 'preseleccionado', label: 'Preseleccionar' },
  { estado: 'aclaracion', label: 'Pedir aclaración' },
  { estado: 'no_seleccionado', label: 'No seleccionar' },
]

export default function Direccion() {
  const { usuario } = useAuth()
  const soloDireccion = usuario.rol === 'direccion'

  const [datos, setDatos] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [procesando, setProcesando] = useState(null)
  const [aviso, setAviso] = useState('')

  const cargar = () => {
    setEstado({ cargando: true, error: '' })
    Promise.all([api.get('/direccion/resumen'), api.get('/direccion/postulaciones'), api.get('/direccion/territorios')])
      .then(([r, p, t]) => setDatos({ resumen: r.dato, postulaciones: p.datos, territorios: t.datos }))
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudo cargar el panel de Dirección.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  const decidir = async (id, nuevoEstado) => {
    setProcesando(id)
    try {
      const r = await api.patch(`/direccion/postulaciones/${id}`, { estado: nuevoEstado })
      setDatos((d) => ({ ...d, postulaciones: d.postulaciones.map((p) => (p.id === id ? r.dato : p)) }))
      setAviso(`${r.dato.codigo}: ${POSTULACION_ESTADO[nuevoEstado].label}.`)
    } catch (err) {
      setAviso(err instanceof ApiError ? err.message : 'No se pudo actualizar la postulación.')
    } finally {
      setProcesando(null)
    }
  }

  const activar = async (id) => {
    setProcesando(id)
    try {
      const r = await api.post(`/direccion/postulaciones/${id}/activar`)
      setDatos((d) => ({ ...d, postulaciones: d.postulaciones.map((p) => (p.id === id ? { ...p, estado: 'aprobado' } : p)) }))
      setAviso(`Activado como Partner ${r.dato.codigo}. Se envió la contraseña temporal a su correo.`)
    } catch (err) {
      setAviso(err instanceof ApiError ? err.message : 'No se pudo activar la postulación.')
    } finally {
      setProcesando(null)
    }
  }

  const cambiarTerritorio = async (id, nuevoEstado) => {
    const anterior = datos.territorios.find((t) => t.id === id).estado
    setDatos((d) => ({ ...d, territorios: d.territorios.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t)) }))
    try {
      await api.patch(`/direccion/territorios/${id}`, { estado: nuevoEstado })
    } catch (err) {
      setDatos((d) => ({ ...d, territorios: d.territorios.map((t) => (t.id === id ? { ...t, estado: anterior } : t)) }))
      setAviso(err instanceof ApiError ? err.message : 'No se pudo cambiar el estado del territorio.')
    }
  }

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando el panel de Dirección…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  const { resumen, postulaciones, territorios } = datos
  const pendientes = postulaciones.filter((p) => p.estado === 'recibida')

  return (
    <>
      <PageHeader title="Panel de Dirección" description={soloDireccion ? 'Supervisión de la red, los territorios y las postulaciones.' : 'Supervisión de tu territorio como Líder Regional.'} />

      <div className="dir-stats">
        <StatCard label="Partners activos" value={resumen.partners.activos ?? 0} note={`de ${resumen.partners.total} en total`} />
        <StatCard label="Postulaciones por revisar" value={pendientes.length} />
        <StatCard label="Preseleccionadas" value={resumen.postulaciones.preseleccionadas ?? 0} />
        <StatCard label="Activadas como Partner" value={resumen.postulaciones.aprobadas ?? 0} />
      </div>

      <p className="visually-hidden" aria-live="polite">{aviso}</p>

      <section className="dir-section" aria-labelledby="territorios">
        <h2 id="territorios">Territorios y convocatorias</h2>
        <p className="muted">Abre, pausa o cierra una convocatoria. La web corporativa muestra el estado elegido.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Territorio</th><th>Estado</th><th>Cupos</th><th>{soloDireccion ? 'Cambiar estado' : ''}</th></tr></thead>
            <tbody>
              {territorios.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.nombre}</strong><br /><span className="muted">{t.region}</span></td>
                  <td><Badge tone={(TERRITORIO_ESTADO[t.estado] || TERRITORIO_ESTADO.proximamente).tone}>{(TERRITORIO_ESTADO[t.estado] || TERRITORIO_ESTADO.proximamente).label}</Badge></td>
                  <td className="dir-cap">{t.capacidad ? <span className="muted">Cupo: {t.capacidad}</span> : <span className="muted">Sin cupo definido</span>}</td>
                  <td>
                    {soloDireccion && (
                      <>
                        <label className="visually-hidden" htmlFor={`st-${t.id}`}>Estado de {t.nombre}</label>
                        <select id={`st-${t.id}`} className="dir-select" value={t.estado} onChange={(e) => cambiarTerritorio(t.id, e.target.value)}>
                          {Object.entries(TERRITORIO_ESTADO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="dir-grid">
        <section className="dir-section" aria-labelledby="bandeja">
          <h2 id="bandeja">Bandeja de revisión</h2>
          <p className="muted">La decisión la toma una persona y queda registrada en el historial.</p>
          {postulaciones.length === 0 ? (
            <Vacio titulo="No hay postulaciones todavía" texto="Aparecerán aquí en cuanto alguien postule a la Red." icono="info" />
          ) : (
            <ul className="dir-apps">
              {postulaciones.map((a) => (
                <li key={a.id} className="card dir-app">
                  <div className="dir-app__head">
                    <div>
                      <p className="dir-app__id">{a.codigo} · {a.nombre}</p>
                      <p className="muted">{a.territorio} · recibida el {new Date(a.creado_en).toLocaleDateString('es-PE')}</p>
                    </div>
                    <Badge tone={POSTULACION_ESTADO[a.estado].tone}>{POSTULACION_ESTADO[a.estado].label}</Badge>
                  </div>
                  {a.estado !== 'aprobado' && (
                    <div className="dir-app__actions">
                      {decisiones.map((d) => (
                        <button key={d.estado} type="button" className="btn btn-ghost" disabled={a.estado === d.estado || procesando === a.id}
                          onClick={() => decidir(a.id, d.estado)}>{d.label}</button>
                      ))}
                      <button type="button" className="btn btn-gold" disabled={procesando === a.id} onClick={() => activar(a.id)}>
                        {procesando === a.id ? 'Procesando…' : 'Activar como Partner'}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="dir-side">
          <section className="card dir-locked" aria-labelledby="comisiones">
            <Icon name="lock" />
            <h2 id="comisiones">Comisiones</h2>
            <p>Bloqueado hasta la validación directiva, legal, contable y tributaria. No se publican porcentajes sin aprobación.</p>
          </section>
        </aside>
      </div>
    </>
  )
}
