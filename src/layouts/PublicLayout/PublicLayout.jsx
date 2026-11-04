import { Link, Outlet } from 'react-router-dom'
import './PublicLayout.css'
import Logo from '../../components/Logo/Logo.jsx'

// Páginas sin sesión: acceso y postulación
export default function PublicLayout() {
  return (
    <div className="public">
      <header className="public__bar">
        <Link to="/acceso" aria-label="Portal TUPLUS Partners, ir al acceso"><Logo tone="light" height={28} /></Link>
        <span className="public__tag">Portal Partners</span>
      </header>
      <main className="public__main" id="contenido">
        <Outlet />
      </main>
      <footer className="public__foot">
        <p>TUPLUS Soluciones Digitales LATAM · Portal Partners en desarrollo (Etapa 1)</p>
      </footer>
    </div>
  )
}
