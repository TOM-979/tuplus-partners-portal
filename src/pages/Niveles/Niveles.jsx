import { useState } from 'react'
import './Niveles.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import LevelLadder from '../../components/LevelLadder/LevelLadder.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { levels } from '../../data/levels.js'

export default function Niveles() {
  const { role, partner } = useRole()
  const current = role === 'partner' ? partner.level : null
  const [selected, setSelected] = useState(current || 'L0')
  const level = levels.find((l) => l.code === selected)
  const leader = levels.find((l) => l.kind === 'funcion')

  return (
    <>
      <PageHeader title="Niveles L0–L6" description="Se asciende por mérito: calidad, resultados cobrados, uso correcto del CRM, ética y liderazgo. El puntaje ayuda, pero cada ascenso lo decide una persona autorizada." />

      <section className="card levels-ladder" aria-labelledby="escalera">
        <h2 id="escalera" className="visually-hidden">Escalera de rangos</h2>
        <LevelLadder current={current} selected={selected} onSelect={setSelected} size="lg" />
      </section>

      <div className="levels-grid">
        <section className="card levels-detail" aria-live="polite" aria-labelledby="detalle">
          <div className="levels-detail__head">
            <h2 id="detalle">{level.code} · {level.name}</h2>
            {current === level.code && <Badge tone="gold">Tu rango actual</Badge>}
          </div>
          <p>{level.summary}</p>
          <div className="levels-cols">
            <div>
              <h3>Puede</h3>
              <ul>{level.can.map((c) => <li key={c}><Icon name="check" size={18} /> {c}</li>)}</ul>
            </div>
            <div>
              <h3>No puede</h3>
              <ul className="is-no">{level.cannot.map((c) => <li key={c}><Icon name="lock" size={18} /> {c}</li>)}</ul>
            </div>
          </div>
          <p className="levels-next"><strong>Siguiente paso:</strong> {level.next}</p>
        </section>

        <section className="card levels-role" aria-labelledby="funcion">
          <Badge tone="info">Función territorial</Badge>
          <h2 id="funcion">{leader.code} · {leader.name}</h2>
          <p>{leader.summary}</p>
          <ul>{leader.can.map((c) => <li key={c}><Icon name="map" size={18} /> {c}</li>)}</ul>
          <p className="levels-confirm"><Icon name="info" size={16} /> El documento WEB-02 define L0 a L5 como rangos y Líder Regional como función. Aquí se muestra como L6 para seguir el esquema L0–L6: confirmar en la reunión técnica.</p>
        </section>
      </div>
    </>
  )
}
