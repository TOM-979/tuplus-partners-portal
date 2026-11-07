import './LevelLadder.css'

// Rangos L0–L5 en orden. Son fijos (vienen de WEB-02); L6 Líder Regional es una función
// aparte y no entra en esta escalera.
const RANKS = [
  { code: 'L0', name: 'Postulante' },
  { code: 'L1', name: 'Candidato en formación' },
  { code: 'L2', name: 'Socio Comercial TUPLUS' },
  { code: 'L3', name: 'Consultor B2B TUPLUS' },
  { code: 'L4', name: 'Senior Partner TUPLUS' },
  { code: 'L5', name: 'MASTER PARTNER TUPLUS' },
]

export default function LevelLadder({ current, selected, onSelect, size = 'md' }) {
  const currentIndex = RANKS.findIndex((l) => l.code === current)
  const interactive = Boolean(onSelect)

  return (
    <div className={`ladder ladder--${size}`}>
      <ol className="ladder__steps" aria-label="Rangos de la Red de Socios">
        {RANKS.map((l, i) => {
          const status = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'next'
          const content = (
            <>
              <span className="ladder__bar" style={{ '--step': i }} />
              <span className="ladder__code">{l.code}</span>
              {size !== 'sm' && <span className="ladder__name">{l.name.replace(' TUPLUS', '')}</span>}
            </>
          )
          return (
            <li key={l.code} className={`ladder__step is-${status}${selected === l.code ? ' is-selected' : ''}`}>
              {interactive ? (
                <button type="button" onClick={() => onSelect(l.code)} aria-pressed={selected === l.code}
                  aria-label={`${l.code} ${l.name}${status === 'current' ? ', tu rango actual' : ''}`}>
                  {content}
                </button>
              ) : (
                <div aria-label={`${l.code} ${l.name}${status === 'current' ? ', tu rango actual' : ''}`}>{content}</div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
