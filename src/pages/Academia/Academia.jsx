import { useEffect, useState } from 'react'
import './Academia.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { Input, Notice, Tabs, fecha, useTabParam } from '../../components/Workspace/Workspace.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'

const TIPO_LABEL = { lectura: 'Lectura', video: 'Video', evaluacion: 'Evaluación' }
const NIVELES = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']
const leccionVacia = () => ({ titulo: '', tipo: 'lectura', contenido: '', duracion_min: 10 })
const preguntaVacia = () => ({ texto: '', opciones: ['', ''], correcta: 0 })

// Academia Comercial: cursos por nivel, evaluaciones y certificados. El servidor valida nivel y publicación.
export default function Academia() {
  const { usuario } = useAuth()
  const admin = usuario.rol === 'direccion'
  const [tab, setTab] = useTabParam('cursos', admin ? ['cursos', 'gestion'] : ['cursos', 'certificados'])
  const [cursos, setCursos] = useState(null)
  const [certificados, setCertificados] = useState([])
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [abierto, setAbierto] = useState(null)

  const cargar = async () => {
    setError('')
    try {
      const [c, cert] = await Promise.all([api.get('/etapas/cursos'), admin ? { dato: [] } : api.get('/etapas/certificados')])
      setCursos(c.dato)
      setCertificados(cert.dato)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { cargar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!cursos) return <div className="card">{error ? <ErrorEstado mensaje={error} onReintentar={cargar} /> : <Cargando texto="Cargando la Academia…" />}</div>

  const tabs = [['cursos', 'Cursos'], ...(admin ? [['gestion', 'Gestionar cursos']] : [['certificados', `Certificados (${certificados.length})`]])]

  return (
    <div className="work-stack">
      <PageHeader title="Academia Comercial"
        description={admin ? 'Publica cursos y controla qué nivel accede a cada uno.' : 'Completa las lecciones, aprueba la evaluación y obtén tu certificado.'} />
      <Tabs items={tabs} value={tab} onChange={setTab} />
      <Notice error>{error}</Notice>
      <Notice>{aviso}</Notice>

      {tab === 'cursos' && (cursos.length === 0
        ? <Vacio titulo="Todavía no hay cursos para tu nivel" texto="Cuando Dirección publique contenido o subas de nivel, aparecerá aquí." icono="book" />
        : (
          <ul className="academy-grid">
            {cursos.map((c) => (
              <CursoCard key={c.id} c={c} abierto={abierto === c.id} admin={admin}
                onToggle={() => setAbierto(abierto === c.id ? null : c.id)}
                onCambio={(msg) => { if (msg) setAviso(msg); cargar() }} />
            ))}
          </ul>
        ))}

      {tab === 'certificados' && (certificados.length === 0
        ? <Vacio titulo="Aún no tienes certificados" texto="Aprueba la evaluación de un curso para recibirlo." icono="award" />
        : (
          <div className="work-list">
            {certificados.map((c) => (
              <article key={c.id} className="work-cert" aria-label={`Certificado de ${c.titulo}`}>
                <span className="work-eyebrow">Certificado TUPLUS Partners</span>
                <h2>{c.titulo}</h2>
                <p>Se certifica que</p>
                <strong>{c.nombre}</strong>
                <p>aprobó este curso con nota {c.nota}/100 el {fecha(c.emitido_en)}.</p>
                <small>Código de verificación: {c.codigo}</small>
                <button type="button" className="btn btn-ghost" onClick={() => window.print()}>Imprimir o guardar en PDF</button>
              </article>
            ))}
          </div>
        ))}

      {tab === 'gestion' && admin && <GestionCursos cursos={cursos} onCambio={(msg) => { setAviso(msg); cargar() }} />}
    </div>
  )
}

function CursoCard({ c, abierto, admin, onToggle, onCambio }) {
  const completo = c.total_lecciones > 0 && c.lecciones_completadas >= c.total_lecciones
  return (
    <li className="card academy-card">
      <h3>{c.titulo}</h3>
      <p className="muted">{c.descripcion}</p>
      <p className="muted">Nivel {c.nivel} · {c.total_lecciones} lecciones{c.tiene_evaluacion ? ' · con evaluación' : ''}</p>
      {!admin && <ProgressBar value={c.lecciones_completadas} max={c.total_lecciones} label={`Avance de ${c.titulo}`} />}
      <div className="academy-meta">
        {admin && <Badge tone={c.publicado ? 'ok' : 'warn'}>{c.publicado ? 'Publicado' : 'Borrador'}</Badge>}
        {!admin && <Badge tone={completo ? 'ok' : 'info'}>{completo ? 'Lecciones completas' : `${c.lecciones_completadas} de ${c.total_lecciones}`}</Badge>}
      </div>
      <button type="button" className="btn btn-ghost" onClick={onToggle} aria-expanded={abierto}>
        {abierto ? 'Cerrar' : admin ? 'Ver contenido' : completo ? 'Repasar o rendir evaluación' : 'Continuar curso'}
      </button>
      {abierto && <DetalleCurso id={c.id} admin={admin} onCambio={onCambio} />}
    </li>
  )
}

function DetalleCurso({ id, admin, onCambio }) {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [resultado, setResultado] = useState(null)

  const cargar = async () => {
    try { setD((await api.get(`/etapas/cursos/${id}`)).dato) } catch (e) { setError(e.message) }
  }
  useEffect(() => { cargar() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error && !d) return <ErrorEstado mensaje={error} onReintentar={cargar} />
  if (!d) return <Cargando linea texto="Cargando lecciones…" />

  const todasListas = d.lecciones.filter((l) => l.tipo !== 'evaluacion').every((l) => l.completada)
  const ya = d.intentos?.find((i) => i.aprobado)

  const completar = async (lid) => {
    setBusy(lid); setError('')
    try { await api.post(`/etapas/lecciones/${lid}/completar`); await cargar(); onCambio() } catch (e) { setError(e.message) } finally { setBusy(null) }
  }
  const enviar = async (e) => {
    e.preventDefault()
    setBusy('eval'); setError('')
    try {
      const r = await api.post(`/etapas/cursos/${id}/evaluar`, { respuestas: d.evaluacion.preguntas.map((q) => respuestas[q.id]) })
      setResultado(r.dato)
      await cargar()
      onCambio(r.dato.aprobado ? `¡Aprobaste con ${r.dato.nota}! Tu certificado ya está disponible.` : '')
    } catch (err) { setError(err.message) } finally { setBusy(null) }
  }
  const faltan = d.evaluacion ? d.evaluacion.preguntas.some((q) => respuestas[q.id] === undefined) : false

  return (
    <div className="academy-lecciones">
      <Notice error>{error}</Notice>
      <ul>
        {d.lecciones.map((l) => (
          <li key={l.id} className={`academy-leccion${l.completada ? ' is-completa' : ''}`}>
            <div>
              <p className="panel-list__title">{l.titulo}</p>
              <p className="muted">{TIPO_LABEL[l.tipo]}{l.duracion_min ? ` · ${l.duracion_min} min` : ''}</p>
              {l.tipo === 'video' && l.contenido && <a href={l.contenido} target="_blank" rel="noopener noreferrer">Abrir video</a>}
              {l.tipo === 'lectura' && l.contenido && <details><summary>Leer</summary><p className="work-prose">{l.contenido}</p></details>}
            </div>
            {!admin && l.tipo !== 'evaluacion' && (l.completada
              ? <Badge tone="ok"><Icon name="check" size={14} /> Completada</Badge>
              : <button type="button" className="btn btn-primary" disabled={busy === l.id} onClick={() => completar(l.id)}>{busy === l.id ? 'Guardando…' : 'Marcar completada'}</button>)}
          </li>
        ))}
      </ul>

      {!admin && d.evaluacion && (
        <section className="work-subcard work-stack" aria-labelledby={`eval-${id}`}>
          <h3 id={`eval-${id}`}>Evaluación final · mínimo {d.evaluacion.minimo}</h3>
          {ya ? <Badge tone="ok"><Icon name="award" size={14} /> Aprobada con {ya.nota}</Badge> : !todasListas ? (
            <p className="muted">Completa todas las lecciones para habilitar la evaluación.</p>
          ) : (
            <form className="work-stack" onSubmit={enviar}>
              {d.evaluacion.preguntas.map((q, i) => (
                <fieldset key={q.id} className="work-question">
                  <legend>{i + 1}. {q.texto}</legend>
                  {q.opciones.map((o, k) => (
                    <label key={k} className="work-option">
                      <input type="radio" name={`p-${id}-${q.id}`} checked={respuestas[q.id] === k} onChange={() => setRespuestas({ ...respuestas, [q.id]: k })} />
                      {o}
                    </label>
                  ))}
                </fieldset>
              ))}
              {resultado && !resultado.aprobado && <Notice error>Sacaste {resultado.nota}; necesitas {resultado.minimo}. Repasa e inténtalo de nuevo (máximo 5 intentos por hora).</Notice>}
              <button type="submit" className="btn btn-primary" disabled={faltan || busy === 'eval'}>{busy === 'eval' ? 'Calificando…' : 'Enviar evaluación'}</button>
            </form>
          )}
          {d.intentos?.length > 0 && <p className="muted">Últimos intentos: {d.intentos.map((i) => `${i.nota}${i.aprobado ? ' ✓' : ''}`).join(' · ')}</p>}
        </section>
      )}
      {admin && d.evaluacion && <p className="muted">Evaluación: {d.evaluacion.preguntas.length} preguntas · mínimo {d.evaluacion.minimo}.</p>}
    </div>
  )
}

function GestionCursos({ cursos, onCambio }) {
  const [form, setForm] = useState({ titulo: '', descripcion: '', nivelId: 'L0', minimo: 70 })
  const [lecciones, setLecciones] = useState([leccionVacia()])
  const [preguntas, setPreguntas] = useState([preguntaVacia()])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const setL = (i, k, v) => setLecciones((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)))
  const setQ = (i, p) => setPreguntas((qs) => qs.map((q, j) => (j === i ? { ...q, ...p } : q)))

  const crear = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await api.post('/etapas/cursos', {
        ...form, minimo: Number(form.minimo),
        lecciones: lecciones.map((l) => ({ ...l, duracion_min: Number(l.duracion_min) || 0 })),
        preguntas,
      })
      setForm({ titulo: '', descripcion: '', nivelId: 'L0', minimo: 70 }); setLecciones([leccionVacia()]); setPreguntas([preguntaVacia()])
      onCambio('Curso creado como borrador. Publícalo cuando esté listo.')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const publicar = async (c) => {
    setError('')
    try { const r = await api.patch(`/etapas/cursos/${c.id}`, { publicado: !c.publicado }); onCambio(r.dato.mensaje) } catch (err) { setError(err.message) }
  }

  return (
    <div className="work-split">
      <form className="card work-stack" onSubmit={crear}>
        <h2 className="work-form-title">Nuevo curso</h2>
        <Notice error>{error}</Notice>
        <div className="work-fields">
          <Input label="Título" required maxLength={160} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <Input label="Nivel mínimo para verlo"><select value={form.nivelId} onChange={(e) => setForm({ ...form, nivelId: e.target.value })}>{NIVELES.map((n) => <option key={n}>{n}</option>)}</select></Input>
          <Input label="Nota mínima (1–100)" type="number" min="1" max="100" value={form.minimo} onChange={(e) => setForm({ ...form, minimo: e.target.value })} />
        </div>
        <Input label="Descripción"><textarea maxLength={500} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></Input>

        <h3>Lecciones</h3>
        {lecciones.map((l, i) => (
          <div key={i} className="work-subcard work-stack">
            <div className="work-fields">
              <Input label={`Lección ${i + 1}`} required maxLength={160} value={l.titulo} onChange={(e) => setL(i, 'titulo', e.target.value)} />
              <Input label="Tipo"><select value={l.tipo} onChange={(e) => setL(i, 'tipo', e.target.value)}><option value="lectura">Lectura</option><option value="video">Video (enlace HTTPS)</option></select></Input>
              <Input label="Minutos" type="number" min="0" max="600" value={l.duracion_min} onChange={(e) => setL(i, 'duracion_min', e.target.value)} />
            </div>
            <Input label={l.tipo === 'video' ? 'Enlace del video (https://…)' : 'Contenido'}><textarea required maxLength={10000} value={l.contenido} onChange={(e) => setL(i, 'contenido', e.target.value)} /></Input>
            {lecciones.length > 1 && <button type="button" className="btn btn-ghost" onClick={() => setLecciones(lecciones.filter((_, j) => j !== i))}>Quitar lección</button>}
          </div>
        ))}
        {lecciones.length < 30 && <button type="button" className="btn btn-ghost" onClick={() => setLecciones([...lecciones, leccionVacia()])}>+ Agregar lección</button>}

        <h3>Evaluación</h3>
        {preguntas.map((q, i) => (
          <div key={i} className="work-subcard work-stack">
            <Input label={`Pregunta ${i + 1}`} required maxLength={500} value={q.texto} onChange={(e) => setQ(i, { texto: e.target.value })} />
            {q.opciones.map((o, k) => (
              <label key={k} className="work-option">
                <input type="radio" name={`ok-${i}`} checked={q.correcta === k} onChange={() => setQ(i, { correcta: k })} aria-label={`Opción ${k + 1} es la correcta`} />
                <input className="work-select" required maxLength={300} aria-label={`Texto de la opción ${k + 1}`} placeholder={`Opción ${k + 1}…`} value={o} onChange={(e) => setQ(i, { opciones: q.opciones.map((x, j) => (j === k ? e.target.value : x)) })} />
              </label>
            ))}
            <div className="work-inline">
              {q.opciones.length < 5 && <button type="button" className="btn btn-ghost" onClick={() => setQ(i, { opciones: [...q.opciones, ''] })}>+ Opción</button>}
              {preguntas.length > 1 && <button type="button" className="btn btn-ghost" onClick={() => setPreguntas(preguntas.filter((_, j) => j !== i))}>Quitar pregunta</button>}
            </div>
            <p className="work-muted">Marca el círculo de la respuesta correcta.</p>
          </div>
        ))}
        {preguntas.length < 20 && <button type="button" className="btn btn-ghost" onClick={() => setPreguntas([...preguntas, preguntaVacia()])}>+ Agregar pregunta</button>}
        <div className="work-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Guardando…' : 'Crear curso (borrador)'}</button></div>
      </form>

      <section className="card work-stack">
        <h2 className="work-form-title">Catálogo</h2>
        {cursos.length === 0 && <p className="work-empty">Aún no hay cursos.</p>}
        {cursos.map((c) => (
          <div key={c.id} className="work-row">
            <div><strong>{c.titulo}</strong><br /><small>Nivel {c.nivel} · {c.total_lecciones} lecciones</small></div>
            <button type="button" className={`btn ${c.publicado ? 'btn-ghost' : 'btn-primary'}`} onClick={() => publicar(c)}>{c.publicado ? 'Retirar' : 'Publicar'}</button>
          </div>
        ))}
      </section>
    </div>
  )
}
