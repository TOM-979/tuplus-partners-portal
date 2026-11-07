import { useEffect, useMemo, useState } from 'react'
import './Crm.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Field from '../../components/Field/Field.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { useAuth, ApiError } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'

const STAGES = [
  { id: 'contacto', name: 'Primer contacto' },
  { id: 'diagnostico', name: 'Diagnóstico' },
  { id: 'propuesta', name: 'Propuesta' },
  { id: 'negociacion', name: 'Negociación' },
  { id: 'cierre', name: 'Cierre' },
  { id: 'posventa', name: 'Posventa' },
]
const money = (n) => (n ? `USD ${Number(n).toLocaleString('es-PE')}` : 'Por cotizar')
const emptyForm = { empresa: '', sector: '', ciudad: '', necesidad: '' }

// CRM Comercial B2B: cada Partner ve solo lo suyo; Líder Regional su territorio; Dirección, todo
export default function Crm() {
  const { usuario } = useAuth()
  const isPartner = usuario.rol === 'partner'

  const [items, setItems] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [notice, setNotice] = useState('')
  const [owner, setOwner] = useState('todos')

  const cargar = () => {
    setEstado({ cargando: true, error: '' })
    api.get('/crm')
      .then((r) => setItems(r.datos))
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudo cargar el CRM.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  const owners = useMemo(() => (items ? [...new Set(items.map((o) => o.partner_codigo))] : []), [items])
  const visible = (items || []).filter((o) => (isPartner ? true : owner === 'todos' || o.partner_codigo === owner))

  const move = async (id, etapa) => {
    const anterior = items.find((o) => o.id === id)
    setItems((list) => list.map((o) => (o.id === id ? { ...o, etapa } : o)))
    try {
      await api.patch(`/crm/${id}`, { etapa })
      setNotice(`${anterior.empresa} pasó a ${STAGES.find((s) => s.id === etapa).name}.`)
    } catch (err) {
      setItems((list) => list.map((o) => (o.id === id ? anterior : o))) // revierte si el servidor lo rechaza
      setNotice(err instanceof ApiError ? err.message : 'No se pudo mover la oportunidad.')
    }
  }

  const add = async (e) => {
    e.preventDefault()
    if (form.empresa.trim().length < 2) { setError('Escribe el nombre de la empresa.'); document.getElementById('empresa')?.focus(); return }
    setGuardando(true); setError('')
    try {
      const r = await api.post('/crm', form)
      setItems((list) => [r.dato, ...list])
      setForm(emptyForm); setShowForm(false)
      setNotice(`Oportunidad ${r.dato.codigo} registrada en Primer contacto.`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar la oportunidad.')
    } finally {
      setGuardando(false)
    }
  }

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando el CRM…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  return (
    <>
      <PageHeader title="CRM de oportunidades"
        description={isPartner ? 'Tus empresas y oportunidades, desde el primer contacto hasta la posventa. Solo ves lo que tú registraste.' : 'Oportunidades de tu alcance, con su Partner de origen.'}
        actions={isPartner && <button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cerrar formulario' : 'Registrar oportunidad'}</button>} />

      {showForm && (
        <form className="card crm-form" onSubmit={add} noValidate aria-labelledby="nueva">
          <h2 id="nueva">Nueva oportunidad</h2>
          <div className="crm-form__fields">
            <Field id="empresa" label="Empresa" error={error}>
              {(a) => <input {...a} value={form.empresa} onChange={(e) => { setForm({ ...form, empresa: e.target.value }); setError('') }} />}
            </Field>
            <Field id="sector" label="Sector">{(a) => <input {...a} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />}</Field>
            <Field id="ciudad" label="Ciudad">{(a) => <input {...a} value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />}</Field>
            <Field id="necesidad" label="¿Qué necesita?" hint="Ejemplo: página web, tienda en línea">{(a) => <input {...a} value={form.necesidad} onChange={(e) => setForm({ ...form, necesidad: e.target.value })} />}</Field>
          </div>
          <div className="crm-form__actions">
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar oportunidad'}</button>
          </div>
        </form>
      )}

      {!isPartner && items.length > 0 && (
        <div className="crm-filter">
          <label htmlFor="owner">Partner</label>
          <select id="owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="todos">Todos</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}

      <p className="visually-hidden" aria-live="polite">{notice}</p>

      {items.length === 0 ? (
        <Vacio titulo="Todavía no hay oportunidades" texto={isPartner ? 'Registra tu primera oportunidad con el botón de arriba.' : 'Cuando los Partners registren oportunidades, aparecerán aquí.'} icono="briefcase" />
      ) : (
        <div className="crm-board" role="region" aria-label="Oportunidades por etapa" tabIndex={0}>
          {STAGES.map((s) => {
            const col = visible.filter((o) => o.etapa === s.id)
            return (
              <section key={s.id} className="crm-col" aria-labelledby={`etapa-${s.id}`}>
                <h2 id={`etapa-${s.id}`}>{s.name} <span>{col.length}</span></h2>
                {col.length === 0 && <p className="crm-empty">Sin oportunidades en esta etapa.</p>}
                <ul>
                  {col.map((o) => (
                    <li key={o.id} className="crm-card">
                      <p className="crm-card__company">{o.empresa}</p>
                      <p className="muted">{[o.necesidad, o.ciudad].filter(Boolean).join(' · ')}</p>
                      <div className="crm-card__meta">
                        <span>{money(o.monto)}</span>
                        {!isPartner && <Badge tone="gold">{o.partner_codigo}</Badge>}
                      </div>
                      {o.proximo_paso && <p className="crm-card__next">{o.proximo_paso}</p>}
                      <label className="visually-hidden" htmlFor={`stage-${o.id}`}>Mover {o.empresa} a otra etapa</label>
                      <select id={`stage-${o.id}`} value={o.etapa} onChange={(e) => move(o.id, e.target.value)}>
                        {STAGES.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
