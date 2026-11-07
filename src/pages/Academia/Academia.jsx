import { useEffect, useState } from 'react'
import './Academia.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { api, ApiError } from '../../lib/api.js'

const TIPO_LABEL = { lectura: 'Lectura', video: 'Video', evaluacion: 'Evaluación' }

// Academia Comercial: el acceso a cada curso depende del nivel del Partner (lo valida el servidor)
export default function Academia() {
  const [cursos, setCursos] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [abierto, setAbierto] = useState(null)
  const [detalle, setDetalle] = useState(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [completando, setCompletando] = useState(null)

  const cargar = () => {
    setEstado({ cargando: true, error: '' })
    api.get('/academia/cursos')
      .then((r) => setCursos(r.datos))
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudieron cargar los cursos.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  const abrir = async (cursoId) => {
    if (abierto === cursoId) { setAbierto(null); return }
    setAbierto(cursoId); setCargandoDetalle(true); setDetalle(null)
    try {
      const r = await api.get(`/academia/cursos/${cursoId}`)
      setDetalle(r.dato)
    } catch {
      setDetalle({ error: true })
    } finally {
      setCargandoDetalle(false)
    }
  }

  const completar = async (leccionId) => {
    setCompletando(leccionId)
    try {
      await api.post(`/academia/lecciones/${leccionId}/completar`)
      const r = await api.get(`/academia/cursos/${abierto}`)
      setDetalle(r.dato)
      cargar() // refresca el avance mostrado en la lista de cursos
    } catch { /* se queda como estaba; el botón sigue disponible para reintentar */ }
    finally { setCompletando(null) }
  }

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando la Academia…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  return (
    <>
      <PageHeader title="Academia Comercial"
        description="Capacítate y avanza lección por lección. Cada nivel habilita nuevos cursos." />

      {cursos.length === 0 ? (
        <Vacio titulo="Todavía no hay cursos para tu nivel" texto="Cuando Dirección publique contenido o subas de nivel, aparecerá aquí." icono="book" />
      ) : (
        <ul className="academy-grid">
          {cursos.map((c) => {
            const completo = c.lecciones_completadas === c.total_lecciones && c.total_lecciones > 0
            return (
              <li key={c.id} className="card academy-card">
                <h3>{c.titulo}</h3>
                <p className="muted">{c.descripcion}</p>
                <p className="muted">Nivel {c.nivel} · {c.total_lecciones} lecciones</p>
                <ProgressBar value={c.lecciones_completadas} max={c.total_lecciones} label={`Avance de ${c.titulo}`} />
                <div className="academy-meta">
                  <Badge tone={completo ? 'ok' : 'info'}>{completo ? 'Curso completo' : `${c.lecciones_completadas} de ${c.total_lecciones}`}</Badge>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => abrir(c.id)} aria-expanded={abierto === c.id}>
                  {abierto === c.id ? 'Cerrar' : completo ? 'Repasar lecciones' : 'Continuar curso'}
                </button>

                {abierto === c.id && (
                  <div className="academy-lecciones">
                    {cargandoDetalle ? <Cargando linea texto="Cargando lecciones…" /> : detalle?.error ? (
                      <ErrorEstado mensaje="No se pudieron cargar las lecciones." onReintentar={() => abrir(c.id)} />
                    ) : (
                      <ul>
                        {detalle.lecciones.map((l) => (
                          <li key={l.id} className={`academy-leccion${l.completada ? ' is-completa' : ''}`}>
                            <div>
                              <p className="panel-list__title">{l.titulo}</p>
                              <p className="muted">{TIPO_LABEL[l.tipo]}{l.duracion_min ? ` · ${l.duracion_min} min` : ''}</p>
                            </div>
                            {l.completada
                              ? <Badge tone="ok"><Icon name="check" size={14} /> Completada</Badge>
                              : <button type="button" className="btn btn-primary" disabled={completando === l.id} onClick={() => completar(l.id)}>
                                  {completando === l.id ? 'Guardando…' : 'Marcar completada'}
                                </button>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}
