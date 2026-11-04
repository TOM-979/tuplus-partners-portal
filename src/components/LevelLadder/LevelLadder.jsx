import './LevelLadder.css'
import { levels } from '../../data/levels.js'

// Escalera de rangos L0–L5: cada peldaño sube según el nivel.
// L6 (Líder Regional) va aparte porque es una función, no un peldaño.
export default function LevelLadder({ current, selected, onSelect, size = 'md' }) {
  const ranks = levels.filter((l) => l.kind === 'rango')
  const currentIndex = ranks.findIndex((l) => l.code === current)
  const interactive = Boolean(onSelect)

  return (
    <div className={`ladder ladder--${size}`}>
      <ol className="ladder__steps" aria-label="Rangos de la Red de Socios">
        {ranks.map((l, i) => {
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
