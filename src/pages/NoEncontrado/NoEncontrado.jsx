import { Link } from 'react-router-dom'
import Icon from '../../components/Icon/Icon.jsx'
import './NoEncontrado.css'

export default function NoEncontrado() {
  return (
    <div className="no-encontrado">
      <Icon name="map" size={32} />
      <h1>No encontramos esta página</h1>
      <p>La dirección no existe o cambió. Revisa el enlace o vuelve al inicio.</p>
      <Link className="btn btn-primary" to="/">Ir al inicio</Link>
    </div>
  )
}
