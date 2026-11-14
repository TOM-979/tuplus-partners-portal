import './StatCard.css'
import Icon from '../Icon/Icon.jsx'

// Cifra clave con etiqueta; el icono es opcional y solo ayuda a reconocerla rápido.
export default function StatCard({ label, value, note, icon }) {
  return (
    <div className="stat">
      <div className="stat__top">
        <p className="stat__label">{label}</p>
        {icon && <span className="stat__icon" aria-hidden="true"><Icon name={icon} size={18} /></span>}
      </div>
      <p className={`stat__value${String(value).length > 8 ? ' stat__value--long' : ''}`}>{value}</p>
      {note && <p className="stat__note">{note}</p>}
    </div>
  )
}
