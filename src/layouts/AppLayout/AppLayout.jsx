import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './AppLayout.css'
import Logo from '../../components/Logo/Logo.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Cada opción indica qué roles la ven (permisos mínimos; el servidor los vuelve a validar)
const nav = [
  { to: '/', label: 'Panel comercial', icon: 'home', roles: ['partner'] },
  { to: '/direccion', label: 'Panel de Dirección', icon: 'chart', roles: ['direccion', 'lider_regional'] },
  { to: '/crm', label: 'CRM de oportunidades', icon: 'briefcase', roles: ['partner', 'direccion', 'lider_regional'] },
  { to: '/academia', label: 'Academia Comercial', icon: 'book', roles: ['partner', 'lider_regional'] },
  { to: '/niveles', label: 'Niveles L0–L6', icon: 'ladder', roles: ['partner', 'direccion', 'lider_regional'] },
  { to: '/perfil', label: 'Mi perfil', icon: 'user', roles: ['partner', 'lider_regional'] },
  { to: '/arquitectura', label: 'Arquitectura y etapas', icon: 'layers', roles: ['direccion'] },
]

const nombreRol = { partner: 'Partner', lider_regional: 'Líder Regional', direccion: 'Dirección Comercial' }

export default function AppLayout() {
  const { usuario, salir } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const items = nav.filter((n) => n.roles.includes(usuario.rol))
  const roleLabel = usuario.partner
    ? `${usuario.partner.nombre} · ${usuario.partner.codigo}`
    : nombreRol[usuario.rol]

  const cerrarSesion = () => {
    salir()
    navigate('/acceso')
  }

  return (
    <div className="app">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <aside className={`sidebar${open ? ' is-open' : ''}`} id="menu-principal">
        <div className="sidebar__brand">
          <Logo tone="light" height={30} />
          <span>Partners</span>
        </div>
        <nav aria-label="Secciones del portal">
          <ul className="sidebar__nav">
            {items.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.to === '/'}>
                  <Icon name={n.icon} /> {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sidebar__foot">
          <p className="sidebar__who">{roleLabel}</p>
          {usuario.partner?.esLiderRegional && usuario.rol !== 'lider_regional' && (
            <p className="sidebar__badge"><Icon name="map" size={14} /> También Líder Regional</p>
          )}
          <button type="button" className="sidebar__switch" onClick={cerrarSesion}>
            <Icon name="logout" size={18} /> Salir
          </button>
        </div>
      </aside>
      {open && <button type="button" className="scrim" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}

      <div className="app__body">
        <header className="topbar">
          <button type="button" className="topbar__menu" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open} aria-controls="menu-principal" onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
          {usuario.partner && (
            <p className="topbar__territory"><Icon name="map" size={16} /> {usuario.partner.territorio || 'Sin territorio asignado'}</p>
          )}
        </header>
        <main className="app__main" id="contenido" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
