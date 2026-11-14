import './Estado.css'
import Icon from '../Icon/Icon.jsx'

// Estados reutilizables para cuando una pantalla depende de datos de la API
export function Cargando({ texto = 'Cargando…', linea = false }) {
  if (linea) {
    return (
      <div className="estado estado--linea" role="status" aria-live="polite">
        <Icon name="loader" size={18} />
        <span>{texto}</span>
      </div>
    )
  }
  return (
    <div className="skeleton" role="status" aria-live="polite" aria-label={texto}>
      <i /><i /><i /><i />
      <span className="visually-hidden">{texto}</span>
    </div>
  )
}

export function ErrorEstado({ mensaje, onReintentar }) {
  return (
    <div className="estado estado--error" role="alert">
      <span className="estado__icono"><Icon name="warning" size={26} /></span>
      <p className="estado__titulo">No se pudo cargar la información</p>
      <p className="estado__texto">{mensaje || 'Ocurrió un error inesperado. Inténtalo de nuevo.'}</p>
      {onReintentar && <button type="button" className="btn btn-ghost" onClick={onReintentar}>Reintentar</button>}
    </div>
  )
}

export function Vacio({ titulo, texto, icono = 'info', accion }) {
  return (
    <div className="estado" role="status">
      <span className="estado__icono"><Icon name={icono} size={26} /></span>
      {titulo && <p className="estado__titulo">{titulo}</p>}
      {texto && <p className="estado__texto">{texto}</p>}
      {accion}
    </div>
  )
}
