import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './Panel.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import LevelLadder from '../../components/LevelLadder/LevelLadder.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { levels } from '../../data/levels.js'
import { stages } from '../../data/crm.js'
import { modules } from '../../data/academy.js'

const money = (n) => (n ? `USD ${n.toLocaleString('es-PE')}` : 'Por cotizar')

// Panel comercial personalizado del Partner
export default function Panel() {
  const { partner } = useRole()
  const [opportunities, setOpportunities] = useState([])
  const [accessError, setAccessError] = useState('')
  useEffect(() => {
    fetch('/api/opportunities', { credentials: 'include' }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setOpportunities(data.opportunities)
    }).catch((error) => setAccessError(error.message))
  }, [])
  const level = levels.find((l) => l.code === partner.level)
  const mine = opportunities.filter((o) => o.partner === partner.id)
  const active = mine.filter((o) => !['cierre', 'posventa'].includes(o.stage))
  const pipeline = mine.filter((o) => o.amount && o.stage !== 'posventa').reduce((s, o) => s + o.amount, 0)
  const lessons = modules.reduce((s, m) => s + m.lessons, 0)
  const done = modules.reduce((s, m) => s + m.done, 0)
  const nextModule = modules.find((m) => m.done < m.lessons && m.exam !== 'bloqueada')

  return (
    <>
      {accessError && <p role="alert">{accessError}</p>}
      <PageHeader title={`Hola, ${partner.name}`} description="Tu avance, tus oportunidades y lo que toca hacer esta semana."
        actions={<Link className="btn btn-primary" to="/crm">Registrar oportunidad</Link>} />

      <div className="panel-grid">
        <section className="card panel-rank" aria-labelledby="rango">
          <div className="panel-rank__head">
            <div>
              <p className="muted">Tu rango actual</p>
              <h2 id="rango">{level.code} · {level.name}</h2>
            </div>
            <Badge tone="gold">Código {partner.id}</Badge>
          </div>
          <LevelLadder current={partner.level} size="sm" />
          <p className="panel-rank__next"><strong>Para subir a L3:</strong> {level.next}</p>
          <Link to="/niveles" className="panel-link">Ver todos los niveles</Link>
        </section>

        <div className="panel-stats">
          <StatCard label="Oportunidades activas" value={active.length} />
          <StatCard label="En negociación" value={mine.filter((o) => o.stage === 'negociacion').length} />
          <StatCard label="Monto en proceso" value={money(pipeline)} note="Propuestas con monto aprobado" />
          <StatCard label="Avance en la Academia" value={`${Math.round((done / lessons) * 100)}%`} note={`${done} de ${lessons} lecciones`} />
        </div>

        <section className="card" aria-labelledby="pendientes">
          <h2 id="pendientes">Próximos pasos</h2>
          <ul className="panel-list">
            {active.map((o) => (
              <li key={o.id}>
                <div>
                  <p className="panel-list__title">{o.next}</p>
                  <p className="muted">{o.company} · {o.need}</p>
                </div>
                <Badge tone="info">{stages.find((s) => s.id === o.stage).name}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="card" aria-labelledby="formacion">
          <h2 id="formacion">Sigue tu formación</h2>
          {nextModule && (
            <div className="panel-module">
              <p className="panel-list__title">{nextModule.title}</p>
              <p className="muted">Módulo de nivel {nextModule.level}</p>
              <ProgressBar value={nextModule.done} max={nextModule.lessons} label={`Avance de ${nextModule.title}`} />
              <Link className="btn btn-ghost" to="/academia">Continuar módulo</Link>
            </div>
          )}
          <div className="panel-locked">
            <Icon name="lock" size={18} />
            <p><strong>Comisiones:</strong> se mostrarán cuando la Dirección, Legal y Contabilidad aprueben el esquema (Etapa 4).</p>
          </div>
        </section>
      </div>
    </>
  )
}
