import { useState } from 'react'
import './Direccion.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { territories as seedTerritories, territoryStates } from '../../data/territories.js'
import { applications as seedApps, applicationStates } from '../../data/applications.js'
import { opportunities } from '../../data/crm.js'

const decisions = [
  { state: 'preseleccionado', label: 'Preseleccionar' },
  { state: 'aclaracion', label: 'Pedir aclaración' },
  { state: 'no_seleccionado', label: 'No seleccionar' },
]

// Panel de Dirección y Gestión: red, territorios, revisión humana y comisiones (bloqueadas)
export default function Direccion() {
  const [territories, setTerritories] = useState(seedTerritories)
  const [apps, setApps] = useState(seedApps)
  const [history, setHistory] = useState([])

  const now = () => new Date().toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'short' })

  const decide = (id, state) => {
    const before = apps.find((a) => a.id === id).state
    setApps((list) => list.map((a) => (a.id === id ? { ...a, state } : a)))
    setHistory((h) => [{ id, from: applicationStates[before].label, to: applicationStates[state].label, actor: 'Dirección Comercial', at: now() }, ...h])
  }

  const setTerritoryState = (id, state) => setTerritories((list) => list.map((t) => (t.id === id ? { ...t, state } : t)))

  const totalPartners = territories.reduce((s, t) => s + t.partners, 0)
  const won = opportunities.filter((o) => ['cierre', 'posventa'].includes(o.stage)).length

  return (
    <>
      <PageHeader title="Panel de Dirección" description="Supervisión de la red, los territorios y las postulaciones. Todas las cifras son de muestra." />

      <div className="dir-stats">
        <StatCard label="Partners activos" value={totalPartners} note="En territorios habilitados" />
        <StatCard label="Postulaciones por revisar" value={apps.filter((a) => a.state === 'recibida').length} />
        <StatCard label="Oportunidades abiertas" value={opportunities.length - won} />
        <StatCard label="Cierres y posventa" value={won} />
      </div>

      <section className="dir-section" aria-labelledby="territorios">
        <h2 id="territorios">Territorios y convocatorias</h2>
        <p className="muted">Abre, pausa o cierra una convocatoria sin tocar código. La web corporativa mostrará el estado elegido.</p>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Territorio</th><th>Estado</th><th>Cupos ocupados</th><th>Responsable</th><th>Cambiar estado</th></tr></thead>
            <tbody>
              {territories.map((t) => (
                <tr key={t.id}>
                  <td><strong>{t.name}</strong><br /><span className="muted">{t.region}</span></td>
                  <td><Badge tone={territoryStates[t.state].tone}>{territoryStates[t.state].label}</Badge></td>
                  <td className="dir-cap">{t.capacity ? <ProgressBar value={t.partners} max={t.capacity} label={`Cupos ocupados en ${t.name}`} /> : <span className="muted">Sin cupo definido</span>}</td>
                  <td>{t.owner}</td>
                  <td>
                    <label className="visually-hidden" htmlFor={`st-${t.id}`}>Estado de {t.name}</label>
                    <select id={`st-${t.id}`} className="dir-select" value={t.state} onChange={(e) => setTerritoryState(t.id, e.target.value)}>
                      {Object.entries(territoryStates).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
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
          <p className="muted">El puntaje ayuda a priorizar; la decisión la toma una persona y queda registrada.</p>
          <ul className="dir-apps">
            {apps.map((a) => (
              <li key={a.id} className="card dir-app">
                <div className="dir-app__head">
                  <div>
                    <p className="dir-app__id">{a.id}</p>
                    <p className="muted">{a.territory} · recibida el {a.date}</p>
                  </div>
                  <Badge tone={applicationStates[a.state].tone}>{applicationStates[a.state].label}</Badge>
                </div>
                <p className="dir-app__score">Puntaje de apoyo: <strong>{a.score}</strong> / 100</p>
                <div className="dir-app__actions">
                  {decisions.map((d) => (
                    <button key={d.state} type="button" className="btn btn-ghost" disabled={a.state === d.state} onClick={() => decide(a.id, d.state)}>{d.label}</button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className="dir-side">
          <section className="card" aria-labelledby="historial">
            <h2 id="historial">Historial de cambios</h2>
            {history.length === 0
              ? <p className="muted dir-empty">Aún no hay decisiones en esta sesión. Cada cambio guarda quién lo hizo y cuándo.</p>
              : (
                <ol className="dir-history" aria-live="polite">
                  {history.map((h, i) => (
                    <li key={i}><strong>{h.id}</strong>: {h.from} → {h.to}<br /><span className="muted">{h.actor} · {h.at}</span></li>
                  ))}
                </ol>
              )}
          </section>
          <section className="card dir-locked" aria-labelledby="comisiones">
            <Icon name="lock" />
            <h2 id="comisiones">Comisiones</h2>
            <p>Bloqueado hasta la validación directiva, legal, contable y tributaria (Etapa 4). No se publican porcentajes sin aprobación.</p>
          </section>
        </aside>
      </div>
    </>
  )
}
