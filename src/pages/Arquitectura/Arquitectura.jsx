import './Arquitectura.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { architecture, stagesPlan } from '../../data/roadmap.js'

const tone = { Existe: 'ok', 'Base creada': 'gold', 'Por construir': 'info', 'Por evaluar': 'warn' }

// Ecosistema TUPLUS y etapas del Sistema Master Partner
export default function Arquitectura() {
  const [web, portal, api, ...rest] = architecture
  const block = (b) => (
    <div className="arch-block">
      <div className="arch-block__head"><h3>{b.name}</h3><Badge tone={tone[b.state]}>{b.state}</Badge></div>
      <p className="arch-block__tech">{b.tech}</p>
      <p>{b.role}</p>
    </div>
  )

  return (
    <>
      <PageHeader title="Arquitectura y etapas" description="Cómo se conecta el portal con la web corporativa y qué cubre esta base en cada etapa. Las herramientas marcadas por evaluar no son decisiones definitivas." />

      <section className="card arch" aria-labelledby="ecosistema">
        <h2 id="ecosistema">Ecosistema TUPLUS</h2>
        {block(web)}
        <p className="arch-link"><span>Enlace de acceso al portal</span></p>
        <div className="arch-portal">{block(portal)}</div>
        <p className="arch-link"><span>{api.name} · {api.tech} <Badge tone={tone[api.state]}>{api.state}</Badge></span></p>
        <div className="arch-row">{rest.slice(0, 2).map((b) => <div key={b.name}>{block(b)}</div>)}</div>
        {block(rest[2])}
      </section>

      <section className="arch-stages" aria-labelledby="etapas">
        <h2 id="etapas">Etapas de desarrollo</h2>
        <ol>
          {stagesPlan.map((s) => (
            <li key={s.n} className={`card${s.n === 1 ? ' is-current' : ''}`}>
              <p className="arch-stage__n">Etapa {s.n}{s.n === 1 && <Badge tone="gold">Actual</Badge>}</p>
              <h3>{s.title}</h3>
              <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <p className="arch-stage__base"><strong>En esta base:</strong> {s.base}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  )
}
