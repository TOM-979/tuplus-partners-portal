import './Academia.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useRole } from '../../context/RoleContext.jsx'
import { modules } from '../../data/academy.js'
import { levels } from '../../data/levels.js'

const examTone = { aprobada: 'ok', pendiente: 'warn', bloqueada: 'neutral' }
const examLabel = { aprobada: 'Evaluación aprobada', pendiente: 'Evaluación pendiente', bloqueada: 'Evaluación bloqueada' }
const order = (code) => Number(code.slice(1))

// Academia Comercial y Aula 2 Plus: el acceso depende del nivel del Partner
export default function Academia() {
  const { role, partner } = useRole()
  const byLevel = [...new Set(modules.map((m) => m.level))]

  return (
    <>
      <PageHeader title="Academia Comercial · Aula 2 Plus"
        description="Capacítate, aprueba las evaluaciones y obtén certificados según tu nivel. Cada nivel abre nuevos módulos."
        actions={role === 'direccion' && <button type="button" className="btn btn-ghost" disabled title="Disponible en la Etapa 2">Gestionar módulos</button>} />

      <div className="stack">
        {byLevel.map((code) => {
          const level = levels.find((l) => l.code === code)
          const locked = role === 'partner' && order(code) > order(partner.level)
          return (
            <section key={code} aria-labelledby={`nivel-${code}`}>
              <h2 id={`nivel-${code}`} className="academy-level">
                {code} · {level.name}
                {locked && <span className="academy-lock"><Icon name="lock" size={16} /> Se abre al llegar a {code}</span>}
              </h2>
              <ul className="academy-grid">
                {modules.filter((m) => m.level === code).map((m) => {
                  const started = m.done > 0
                  const complete = m.done === m.lessons
                  return (
                    <li key={m.id} className={`card academy-card${locked ? ' is-locked' : ''}`}>
                      <h3>{m.title}</h3>
                      <p className="muted">{m.lessons} lecciones</p>
                      <ProgressBar value={m.done} max={m.lessons} label={`Avance de ${m.title}`} />
                      <div className="academy-meta">
                        <Badge tone={examTone[locked ? 'bloqueada' : m.exam]}>{examLabel[locked ? 'bloqueada' : m.exam]}</Badge>
                        {m.certificate && <span className="academy-cert"><Icon name="award" size={18} /> Certificado</span>}
                      </div>
                      {!locked && !complete && (
                        <button type="button" className="btn btn-ghost">{started ? 'Continuar' : 'Empezar módulo'}</button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
        <p className="muted academy-note">La Academia empieza como módulo propio del portal. Moodle queda como opción de evolución, por evaluar.</p>
      </div>
    </>
  )
}
