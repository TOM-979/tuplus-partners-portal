import { useEffect, useMemo, useState } from 'react'
import './Crm.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Field from '../../components/Field/Field.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { useAuth, ApiError } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'
import { Input, Notice, Tabs, fecha, useTabParam } from '../../components/Workspace/Workspace.jsx'

export const STAGES = [
  { id: 'contacto', name: 'Primer contacto' },
  { id: 'diagnostico', name: 'Diagnóstico' },
  { id: 'propuesta', name: 'Propuesta' },
  { id: 'negociacion', name: 'Negociación' },
  { id: 'cierre', name: 'Cierre' },
  { id: 'posventa', name: 'Posventa' },
]
const money = (n, m = 'USD') => (n ? `${m} ${Number(n).toLocaleString('es-PE')}` : 'Por cotizar')
const emptyForm = { empresa: '', contacto: '', sector: '', ciudad: '', necesidad: '', monto: '', moneda: 'USD', proximoPaso: '' }

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
  const [tab, setTab] = useTabParam('oportunidades', ['oportunidades', 'empresas'])
  const [seleccion, setSeleccion] = useState(null)

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
        actions={isPartner && tab === 'oportunidades' && <button type="button" className="btn btn-primary" aria-expanded={showForm} onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cerrar formulario' : 'Registrar oportunidad'}</button>} />

      <Tabs value={tab} onChange={setTab} items={[['oportunidades', 'Oportunidades'], ['empresas', 'Empresas y contactos']]} />

      {tab === 'empresas' && <Empresas isPartner={isPartner} />}

      {tab === 'oportunidades' && showForm && (
        <form className="card crm-form" onSubmit={add} noValidate aria-labelledby="nueva">
          <h2 id="nueva">Nueva oportunidad</h2>
          <div className="crm-form__fields">
            <Field id="empresa" label="Empresa" error={error}>
              {(a) => <input {...a} value={form.empresa} onChange={(e) => { setForm({ ...form, empresa: e.target.value }); setError('') }} />}
            </Field>
            <Field id="sector" label="Sector">{(a) => <input {...a} value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />}</Field>
            <Field id="ciudad" label="Ciudad">{(a) => <input {...a} value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />}</Field>
            <Field id="necesidad" label="¿Qué necesita?" hint="Ejemplo: página web, tienda en línea">{(a) => <input {...a} value={form.necesidad} onChange={(e) => setForm({ ...form, necesidad: e.target.value })} />}</Field>
            <Field id="contacto" label="Persona de contacto">{(a) => <input {...a} value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} />}</Field>
            <Field id="monto" label="Importe estimado" hint="Opcional. Hasta dos decimales.">{(a) => <input {...a} type="number" min="0" step="0.01" inputMode="decimal" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />}</Field>
            <Field id="moneda" label="Moneda">{(a) => <select {...a} value={form.moneda} onChange={(e) => setForm({ ...form, moneda: e.target.value })}><option value="USD">USD · Dólares</option><option value="PEN">PEN · Soles</option></select>}</Field>
            <Field id="proximoPaso" label="Próximo paso">{(a) => <input {...a} maxLength={160} value={form.proximoPaso} onChange={(e) => setForm({ ...form, proximoPaso: e.target.value })} />}</Field>
          </div>
          <div className="crm-form__actions">
            <button type="submit" className="btn btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar oportunidad'}</button>
          </div>
        </form>
      )}

      {tab === 'oportunidades' && !isPartner && items.length > 0 && (
        <div className="crm-filter">
          <label htmlFor="owner">Partner</label>
          <select id="owner" value={owner} onChange={(e) => setOwner(e.target.value)}>
            <option value="todos">Todos</option>
            {owners.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}

      <p className="visually-hidden" aria-live="polite">{notice}</p>

      {tab !== 'oportunidades' ? null : items.length === 0 ? (
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
                        <span>{money(o.monto, o.moneda)}</span>
                        {!isPartner && <Badge tone="gold">{o.partner_codigo}</Badge>}
                      </div>
                      {o.proximo_paso && <p className="crm-card__next">{o.proximo_paso}</p>}
                      <label className="visually-hidden" htmlFor={`stage-${o.id}`}>Mover {o.empresa} a otra etapa</label>
                      <select id={`stage-${o.id}`} value={o.etapa} onChange={(e) => move(o.id, e.target.value)}>
                        {STAGES.map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                      </select>
                      <button type="button" className="btn btn-ghost" onClick={() => setSeleccion(o)}>Seguimiento</button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
      {seleccion && <Seguimientos oportunidad={seleccion} onCerrar={() => setSeleccion(null)} />}
    </>
  )
}

const TIPOS = { llamada: 'Llamada', reunion: 'Reunión', nota: 'Nota', posventa: 'Posventa' }

function Seguimientos({ oportunidad, onCerrar }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ tipo: 'llamada', detalle: '', fecha: '' })
  const [busy, setBusy] = useState(false)
  const cargar = () => api.get(`/etapas/oportunidades/${oportunidad.id}/seguimientos`).then((r) => setLista(r.dato)).catch((e) => setError(e.message))
  useEffect(() => { cargar() }, [oportunidad.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const guardar = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      await api.post(`/etapas/oportunidades/${oportunidad.id}/seguimientos`, { ...form, fecha: form.fecha || null })
      setForm({ tipo: 'llamada', detalle: '', fecha: '' })
      await cargar()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  const cerrar = async (id) => {
    try { await api.patch(`/etapas/seguimientos/${id}/completar`); await cargar() } catch (err) { setError(err.message) }
  }
  return (
    <section className="card work-stack" aria-label={`Seguimiento de ${oportunidad.empresa}`} style={{ marginTop: 'var(--space-5)' }}>
      <div className="work-section-head">
        <h2>Seguimiento · {oportunidad.empresa}</h2>
        <button type="button" className="btn btn-ghost" onClick={onCerrar}>Cerrar</button>
      </div>
      <Notice error>{error}</Notice>
      <form className="work-fields" onSubmit={guardar}>
        <Input label="Tipo"><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>{Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Input>
        <Input label="Fecha (opcional)" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
        <Input label="Detalle" required maxLength={1000} value={form.detalle} onChange={(e) => setForm({ ...form, detalle: e.target.value })} />
        <div className="work-actions"><button type="submit" className="btn btn-primary" disabled={busy || !form.detalle.trim()}>{busy ? 'Guardando…' : 'Agregar'}</button></div>
      </form>
      {!lista ? <Cargando linea texto="Cargando seguimiento…" /> : lista.length === 0 ? <p className="work-empty">Sin seguimientos todavía.</p> : (
        <div className="work-list">
          {lista.map((s) => (
            <div key={s.id} className="work-row">
              <div><strong>{TIPOS[s.tipo]}</strong> · {s.detalle}<br /><small>{s.fecha ? fecha(s.fecha) : 'Sin fecha'} · {s.autor}</small></div>
              {s.estado === 'pendiente' ? <button type="button" className="btn btn-ghost" onClick={() => cerrar(s.id)}>Marcar hecho</button> : <Badge tone="ok">Hecho</Badge>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

const contactoVacio = { empresaId: null, nombre: '', cargo: '', correo: '', telefono: '' }

function Empresas({ isPartner }) {
  const [lista, setLista] = useState(null)
  const [error, setError] = useState('')
  const [emp, setEmp] = useState({ nombre: '', sector: '', ciudad: '' })
  const [con, setCon] = useState(contactoVacio)
  const cargar = () => api.get('/etapas/empresas').then((r) => setLista(r.dato)).catch((e) => setError(e.message))
  useEffect(() => { cargar() }, [])
  const run = async (fn, reset) => {
    setError('')
    try { await fn(); reset(); await cargar() } catch (e) { setError(e.message) }
  }
  if (!lista) return error ? <ErrorEstado mensaje={error} onReintentar={cargar} /> : <Cargando texto="Cargando empresas…" />
  return (
    <div className="work-stack">
      <Notice error>{error}</Notice>
      {isPartner && (
        <form className="card work-fields crm-empresa-form" onSubmit={(e) => { e.preventDefault(); run(() => api.post('/etapas/empresas', emp), () => setEmp({ nombre: '', sector: '', ciudad: '' })) }}>
          <Input label="Empresa" required maxLength={160} value={emp.nombre} onChange={(e) => setEmp({ ...emp, nombre: e.target.value })} />
          <Input label="Sector" maxLength={80} value={emp.sector} onChange={(e) => setEmp({ ...emp, sector: e.target.value })} />
          <Input label="Ciudad" maxLength={80} value={emp.ciudad} onChange={(e) => setEmp({ ...emp, ciudad: e.target.value })} />
          <div className="work-actions"><button type="submit" className="btn btn-primary">Agregar empresa</button></div>
        </form>
      )}
      {lista.length === 0 ? <Vacio titulo="Sin empresas registradas" texto={isPartner ? 'Agrega tu primera empresa arriba.' : 'Aparecerán cuando los Partners las registren.'} icono="briefcase" /> : lista.map((e) => (
        <section key={e.id} className="card work-stack">
          <div><h3>{e.nombre}</h3><p className="work-muted">{[e.sector, e.ciudad].filter(Boolean).join(' · ') || 'Sin detalles'}{!isPartner && ` · ${e.partner_codigo}`}</p></div>
          {e.contactos.length === 0 ? <p className="work-empty">Sin contactos.</p> : e.contactos.map((c) => (
            <div key={c.id} className="work-row"><div><strong>{c.nombre}</strong>{c.cargo && ` · ${c.cargo}`}<br /><small>{[c.correo, c.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</small></div></div>
          ))}
          {isPartner && (con.empresaId === e.id ? (
            <form className="work-fields" onSubmit={(ev) => { ev.preventDefault(); run(() => api.post(`/etapas/empresas/${e.id}/contactos`, con), () => setCon(contactoVacio)) }}>
              <Input label="Nombre" required maxLength={120} value={con.nombre} onChange={(x) => setCon({ ...con, nombre: x.target.value })} />
              <Input label="Cargo" maxLength={100} value={con.cargo} onChange={(x) => setCon({ ...con, cargo: x.target.value })} />
              <Input label="Correo" type="email" maxLength={160} value={con.correo} onChange={(x) => setCon({ ...con, correo: x.target.value })} />
              <Input label="Teléfono" maxLength={30} value={con.telefono} onChange={(x) => setCon({ ...con, telefono: x.target.value })} />
              <div className="work-actions"><button type="submit" className="btn btn-primary">Guardar contacto</button><button type="button" className="btn btn-ghost" onClick={() => setCon(contactoVacio)}>Cancelar</button></div>
            </form>
          ) : <button type="button" className="btn btn-ghost" style={{ justifySelf: 'start' }} onClick={() => setCon({ ...contactoVacio, empresaId: e.id })}>+ Agregar contacto</button>)}
        </section>
      ))}
    </div>
  )
}
