import { useEffect, useState } from 'react'
import './Crm.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Field from '../../components/Field/Field.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { stages } from '../../data/crm.js'

const money = (n) => (n ? `USD ${n.toLocaleString('es-PE')}` : 'Por cotizar')
const emptyForm = { company: '', sector: '', city: '', need: '' }

// CRM Comercial B2B: cada Partner ve solo lo suyo; la Dirección ve todo
export default function Crm() {
  const { role, partner } = useRole()
  const [items, setItems] = useState([])
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [owner, setOwner] = useState('todos')

  const isPartner = role === 'partner'
  useEffect(() => {
    fetch('/api/opportunities', { credentials: 'include' })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data })
      .then((data) => setItems(data.opportunities))
      .catch((err) => setLoadError(err.message))
  }, [])
  const owners = [...new Set(items.map((o) => o.partner))]
  const visible = items.filter((o) => (role !== 'direccion' ? true : owner === 'todos' || o.partner === owner))

  const move = (id, stage) => {
    setItems((list) => list.map((o) => (o.id === id ? { ...o, stage } : o)))
    const o = items.find((x) => x.id === id)
    setNotice(`${o.company} pasó a ${stages.find((s) => s.id === stage).name}.`)
  }

  const add = (e) => {
    e.preventDefault()
    if (form.company.trim().length < 2) { setError('Escribe el nombre de la empresa.'); document.getElementById('company')?.focus(); return }
    const id = `OP-${200 + items.length}`
    setItems((list) => [{ id, ...form, stage: 'contacto', partner: partner.id, amount: null, next: 'Agendar primer contacto' }, ...list])
    setForm(emptyForm); setShowForm(false); setError('')
    setNotice(`Oportunidad ${id} registrada en Primer contacto.`)
  }

  return (
    <>
      <PageHeader title="CRM de oportunidades"
        description={isPartner ? 'Tus empresas y oportunidades, desde el primer contacto hasta la posventa. Solo ves lo que tú registraste.' : 'Todas las oportunidades de la red, con su Partner de origen. Herramienta definitiva por evaluar: EspoCRM.'}
        actions={isPartner && <button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cerrar formulario' : 'Registrar oportunidad'}</button>} />

      {showForm && (
        <form className="card crm-form" onSubmit={add} noValidate aria-labelledby="nueva">
          <h2 id="nueva">Nueva oportunidad</h2>
          <div className="crm-form__fields">
            <Field id="company" label="Empresa" error={error}>
              {(a) => <input {...a} value={form.company} onChange={(e) => { setForm({ ...form, company: e.target.value }); setError('') }} />}
            </Field>
            <Field id="sector" label="Sector">{(a) => <input {...a} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />}</Field>
            <Field id="city" label="Ciudad">{(a) => <input {...a} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />}</Field>
            <Field id="need" label="¿Qué necesita?" hint="Ejemplo: página web, tienda en línea">{(a) => <input {...a} value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })} />}</Field>
          </div>
          <div className="crm-form__actions">
            <button type="submit" className="btn btn-primary">Guardar oportunidad</button>
          </div>
        </form>
      )}

      {!isPartner && (
        <div className="crm-filter">
          <label htmlFor="owner">Partner</label>
          <select id="owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="todos">Todos</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}

      {(loadError || notice) && <p role={loadError ? 'alert' : 'status'}>{loadError || notice}</p>}

      <div className="crm-board" role="region" aria-label="Oportunidades por etapa" tabIndex={0}>
        {stages.map((s) => {
          const col = visible.filter((o) => o.stage === s.id)
          return (
            <section key={s.id} className="crm-col" aria-labelledby={`etapa-${s.id}`}>
              <h2 id={`etapa-${s.id}`}>{s.name} <span>{col.length}</span></h2>
              {col.length === 0 && <p className="crm-empty">Sin oportunidades en esta etapa.</p>}
              <ul>
                {col.map((o) => (
                  <li key={o.id} className="crm-card">
                    <p className="crm-card__company">{o.company}</p>
                    <p className="muted">{[o.need, o.city].filter(Boolean).join(' · ')}</p>
                    <div className="crm-card__meta">
                      <span>{money(o.amount)}</span>
                      {!isPartner && <Badge tone="gold">{o.partner}</Badge>}
                    </div>
                    <p className="crm-card__next">{o.next}</p>
                    <label className="visually-hidden" htmlFor={`stage-${o.id}`}>Mover {o.company} a otra etapa</label>
                    <select id={`stage-${o.id}`} value={o.stage} onChange={(e) => move(o.id, e.target.value)}>
                      {stages.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}
