import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Panel.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import LevelLadder from '../../components/LevelLadder/LevelLadder.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { api, ApiError } from '../../lib/api.js'

const ETAPA_NOMBRE = { contacto: 'Primer contacto', diagnostico: 'Diagnóstico', propuesta: 'Propuesta', negociacion: 'Negociación', cierre: 'Cierre', posventa: 'Posventa' }
const ETAPAS = Object.entries(ETAPA_NOMBRE)
const fecha = (v) => (v ? new Date(v).toLocaleDateString('es-PE', { timeZone: 'UTC' }) : 'Sin fecha')

// Inicio de Dirección: la misma estructura que el panel del Partner, con datos reales de toda la red.
export default function PanelDireccion() {
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [d, setD] = useState(null)

  const cargar = () => {
    setEstado({ cargando: true, error: '' })
    Promise.all([api.get('/direccion/resumen'), api.get('/direccion/postulaciones'), api.get('/etapas/gestion'), api.get('/etapas/cursos')])
      .then(([r, p, g, c]) => setD({ resumen: r.dato, postulaciones: p.datos, gestion: g.dato, cursos: c.dato }))
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudo cargar el panel.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando el panel…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  const { resumen, postulaciones, gestion, cursos } = d
  const porRevisar = postulaciones.filter((p) => p.estado === 'recibida')
  const activas = gestion.oportunidades.filter((o) => !['cierre', 'posventa'].includes(o.etapa))
  const publicados = cursos.filter((c) => c.publicado).length

  const maxEtapa = Math.max(1, ...ETAPAS.map(([id]) => gestion.oportunidades.filter((o) => o.etapa === id).length))
  const conteoTerritorios = gestion.partners.reduce((acc, p) => ({ ...acc, [p.territorio]: (acc[p.territorio] || 0) + 1 }), {})
  const territorios = Object.entries(conteoTerritorios).sort((a, b) => b[1] - a[1])
  const maxTerritorio = Math.max(1, ...territorios.map(([, n]) => n))

  // Cada moneda por separado: nunca se suman soles con dólares
  const porMoneda = gestion.oportunidades
    .filter((o) => o.monto && o.etapa !== 'posventa')
    .reduce((acc, o) => ({ ...acc, [o.moneda]: (acc[o.moneda] || 0) + Number(o.monto) }), {})
  const enProceso = Object.entries(porMoneda).map(([m, v]) => `${m} ${v.toLocaleString('es-PE')}`).join(' · ') || 'Sin montos registrados'

  return (
    <>
      <PageHeader title="Hola, Dirección" description="El estado de toda la red, lo que espera tu decisión y lo que viene esta semana."
        actions={<Link className="btn btn-primary" to="/direccion">Revisar postulaciones</Link>} />

      <div className="panel-grid">
        <section className="panel-hero" aria-labelledby="rango">
          <div className="panel-hero__text">
            <Badge tone="gold">Acceso total</Badge>
            <p className="panel-hero__label">Tu rol</p>
            <h2 id="rango">Dirección Comercial</h2>
            <p className="panel-hero__next">Ves y gestionas todos los niveles, territorios y Partners de la red.</p>
            <Link to="/niveles" className="panel-hero__link">Ver todos los niveles <Icon name="arrowRight" size={16} /></Link>
          </div>
          <div className="panel-hero__ladder">
            <LevelLadder current="L5" size="sm" />
            <p className="panel-hero__cap">Nivel máximo de acceso</p>
          </div>
        </section>

        <div className="panel-stats">
          <StatCard icon="users" label="Partners activos" value={resumen.partners.activos ?? 0} note={`de ${resumen.partners.total ?? 0} en total`} />
          <StatCard icon="mail" label="Postulaciones por revisar" value={porRevisar.length} />
          <StatCard icon="briefcase" label="Oportunidades activas" value={activas.length} note="En toda la red" />
          <StatCard icon="book" label="Cursos publicados" value={publicados} note={`de ${cursos.length} en la Academia`} />
        </div>

        <section className="card" aria-labelledby="embudo">
          <h2 id="embudo">Embudo comercial</h2>
          <p className="muted">Oportunidades por etapa en toda la red.</p>
          {gestion.oportunidades.length === 0
            ? <Vacio titulo="Sin oportunidades todavía" texto="El embudo se llena cuando los Partners registran oportunidades." icono="chart" />
            : (
              <ul className="bars">
                {ETAPAS.map(([id, nombre]) => {
                  const n = gestion.oportunidades.filter((o) => o.etapa === id).length
                  return (
                    <li key={id}>
                      <span className="bars__label">{nombre}</span>
                      <span className="bars__track"><i style={{ width: `${(n / maxEtapa) * 100}%` }} /></span>
                      <span className="bars__n">{n}</span>
                    </li>
                  )
                })}
              </ul>
            )}
        </section>

        <section className="card" aria-labelledby="territorios-red">
          <h2 id="territorios-red">Partners por territorio</h2>
          <p className="muted">Dónde está creciendo la red.</p>
          {territorios.length === 0
            ? <Vacio titulo="Sin Partners todavía" texto="Aparecerán cuando actives a los primeros Partners." icono="map" />
            : (
              <ul className="bars">
                {territorios.map(([nombre, n]) => (
                  <li key={nombre}>
                    <span className="bars__label">{nombre}</span>
                    <span className="bars__track bars__track--gold"><i style={{ width: `${(n / maxTerritorio) * 100}%` }} /></span>
                    <span className="bars__n">{n}</span>
                  </li>
                ))}
              </ul>
            )}
        </section>

        <section className="card" aria-labelledby="revisar">
          <h2 id="revisar">Esperan tu decisión</h2>
          {porRevisar.length === 0
            ? <Vacio titulo="Nada por revisar" texto="Cuando alguien postule a la Red, aparecerá aquí." icono="check" />
            : (
              <ul className="panel-list">
                {porRevisar.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <div>
                      <p className="panel-list__title">{p.nombre}</p>
                      <p className="muted">{p.codigo} · {p.territorio} · {fecha(p.creado_en)}</p>
                    </div>
                    <Badge tone="info">Recibida</Badge>
                  </li>
                ))}
              </ul>
            )}
          {porRevisar.length > 0 && <Link className="btn btn-ghost" style={{ marginTop: 'var(--space-4)' }} to="/direccion">Ir a la bandeja</Link>}
        </section>

        <section className="card" aria-labelledby="pendientes">
          <h2 id="pendientes">Seguimientos pendientes</h2>
          {gestion.pendientes.length === 0
            ? <Vacio titulo="Sin seguimientos pendientes" texto="Los compromisos que registren los Partners aparecerán aquí." icono="clock" />
            : (
              <ul className="panel-list">
                {gestion.pendientes.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <div>
                      <p className="panel-list__title">{s.empresa}</p>
                      <p className="muted">{s.detalle} · {s.partner_codigo}</p>
                    </div>
                    <Badge tone="warn">{fecha(s.fecha)}</Badge>
                  </li>
                ))}
              </ul>
            )}
        </section>

        <section className="card panel-wide" aria-labelledby="cartera">
          <h2 id="cartera">Oportunidades activas de la red</h2>
          <p className="muted">Monto en proceso: {enProceso}</p>
          {activas.length === 0
            ? <Vacio titulo="Todavía no hay oportunidades activas" texto="Aparecerán cuando los Partners las registren en el CRM." icono="briefcase" />
            : (
              <ul className="panel-list">
                {activas.slice(0, 6).map((o) => (
                  <li key={o.id}>
                    <div>
                      <p className="panel-list__title">{o.empresa}</p>
                      <p className="muted">{o.partner_codigo} · {o.territorio}{o.necesidad ? ` · ${o.necesidad}` : ''}</p>
                    </div>
                    <Badge tone="info">{ETAPA_NOMBRE[o.etapa]}</Badge>
                  </li>
                ))}
              </ul>
            )}
        </section>
      </div>
    </>
  )
}
