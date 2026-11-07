import './Estado.css'
import Icon from '../Icon/Icon.jsx'

// Estados reutilizables para cuando una pantalla depende de datos de la API
export function Cargando({ texto = 'Cargando…', linea = false }) {
  return (
    <div className={`estado${linea ? ' estado--linea' : ''}`} role="status" aria-live="polite">
      <Icon name="loader" size={linea ? 18 : 28} />
      {!linea && <p className="estado__texto">{texto}</p>}
      {linea && <span>{texto}</span>}
    </div>
  )
}

export function ErrorEstado({ mensaje, onReintentar }) {
  return (
    <div className="estado estado--error" role="alert">
      <Icon name="warning" size={28} />
      <p className="estado__titulo">No se pudo cargar la información</p>
      <p className="estado__texto">{mensaje || 'Ocurrió un error inesperado. Inténtalo de nuevo.'}</p>
      {onReintentar && <button type="button" className="btn btn-ghost" onClick={onReintentar}>Reintentar</button>}
    </div>
  )
}

export function Vacio({ titulo, texto, icono = 'info', accion }) {
  return (
    <div className="estado" role="status">
      <Icon name={icono} size={28} />
      {titulo && <p className="estado__titulo">{titulo}</p>}
      {texto && <p className="estado__texto">{texto}</p>}
      {accion}
    </div>
  )
}
