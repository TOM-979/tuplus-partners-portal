import { useEffect, useState } from 'react'
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './AppLayout.css'
import Logo from '../../components/Logo/Logo.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useRole } from '../../context/RoleContext.jsx'

// Cada opción indica qué roles la ven (permisos mínimos)
const nav = [
  { to: '/', label: 'Panel comercial', icon: 'home', roles: ['partner'] },
  { to: '/direccion', label: 'Panel de Dirección', icon: 'chart', roles: ['direccion'] },
  { to: '/crm', label: 'CRM de oportunidades', icon: 'briefcase', roles: ['partner', 'direccion'] },
  { to: '/academia', label: 'Academia Comercial', icon: 'book', roles: ['partner', 'direccion'] },
  { to: '/niveles', label: 'Niveles L0–L6', icon: 'ladder', roles: ['partner', 'direccion'] },
  { to: '/perfil', label: 'Mi perfil', icon: 'user', roles: ['partner'] },
  { to: '/arquitectura', label: 'Arquitectura y etapas', icon: 'layers', roles: ['direccion'] },
]

export default function AppLayout() {
  const { role, setRole, partner } = useRole()
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

  if (!role) return <Navigate to="/acceso" replace />

  const items = nav.filter((n) => n.roles.includes(role))
  const roleLabel = role === 'partner' ? `${partner.name} · ${partner.id}` : 'Dirección Comercial'

  const switchRole = () => {
    const next = role === 'partner' ? 'direccion' : 'partner'
    setRole(next)
    navigate(next === 'partner' ? '/' : '/direccion')
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
          <button type="button" className="sidebar__switch" onClick={switchRole}>
            <Icon name="users" size={18} /> Ver como {role === 'partner' ? 'Dirección' : 'Partner'}
          </button>
          <button type="button" className="sidebar__switch" onClick={() => { setRole(null); navigate('/acceso') }}>
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
          <p className="topbar__demo"><Icon name="info" size={16} /> Base de demostración con datos de muestra</p>
          {role === 'partner' && <p className="topbar__territory"><Icon name="map" size={16} /> {partner.territory}</p>}
        </header>
        <main className="app__main" id="contenido" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
