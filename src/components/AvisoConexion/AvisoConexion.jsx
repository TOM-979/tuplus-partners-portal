import { useEffect, useState } from 'react'
import Icon from '../Icon/Icon.jsx'
import './AvisoConexion.css'

// Aviso fijo cuando el navegador detecta que no hay conexión a internet
export default function AvisoConexion() {
  const [enLinea, setEnLinea] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))

  useEffect(() => {
    const on = () => setEnLinea(true)
    const off = () => setEnLinea(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  if (enLinea) return null
  return (
    <div className="aviso-conexion" role="status">
      <Icon name="wifiOff" size={16} /> Sin conexión a internet. Lo que veas puede estar desactualizado hasta que vuelva la señal.
    </div>
  )
}
