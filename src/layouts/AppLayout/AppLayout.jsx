import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import './AppLayout.css'
import Logo from '../../components/Logo/Logo.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// Cada opción indica qué roles la ven (permisos mínimos; el servidor los vuelve a validar)
const grupos = [
  {
    titulo: 'Mi trabajo',
    items: [
      { to: '/', label: 'Panel comercial', corto: 'Panel', icon: 'home', roles: ['partner', 'direccion'] },
      { to: '/direccion', label: 'Supervisión de la red', corto: 'Dirección', icon: 'chart', roles: ['direccion', 'lider_regional'] },
      { to: '/gestion', label: 'Gestión ejecutiva', corto: 'Gestión', icon: 'layers', roles: ['direccion', 'lider_regional'] },
      { to: '/crm', label: 'CRM de oportunidades', corto: 'CRM', icon: 'briefcase', roles: ['partner', 'direccion', 'lider_regional'] },
      { to: '/academia', label: 'Academia Comercial', corto: 'Academia', icon: 'book', roles: ['partner', 'lider_regional', 'direccion'] },
    ],
  },
  {
    titulo: 'Red y cuenta',
    items: [
      { to: '/niveles', label: 'Niveles L0–L6', corto: 'Niveles', icon: 'ladder', roles: ['partner', 'direccion', 'lider_regional'] },
      { to: '/perfil', label: 'Mi perfil', corto: 'Perfil', icon: 'user', roles: ['partner', 'lider_regional', 'direccion'] },
    ],
  },
]

const nombreRol = { partner: 'Partner', lider_regional: 'Líder Regional', direccion: 'Dirección Comercial' }

const iniciales = (nombre) => nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '·'

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

  const secciones = grupos
    .map((g) => ({ ...g, items: g.items.filter((n) => n.roles.includes(usuario.rol)) }))
    .filter((g) => g.items.length)
  const todas = secciones.flatMap((g) => g.items)
  const actual = todas.find((n) => (n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)))
  const barraInferior = todas.slice(0, 4)

  const nombre = usuario.partner?.nombre || nombreRol[usuario.rol]
  const detalle = usuario.partner ? `${nombreRol[usuario.rol]} · ${usuario.partner.codigo}` : usuario.correo

  const cerrarSesion = () => {
    salir()
    navigate('/acceso')
  }

  return (
    <div className="app">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <aside className={`sidebar${open ? ' is-open' : ''}`} id="menu-principal" aria-label="Menú principal">
        <div className="sidebar__brand">
          <Logo tone="light" height={30} />
          <span>Partners</span>
        </div>
        <nav aria-label="Secciones del portal">
          {secciones.map((g) => (
            <div key={g.titulo} className="sidebar__group">
              <p className="sidebar__group-title">{g.titulo}</p>
              <ul className="sidebar__nav">
                {g.items.map((n) => (
                  <li key={n.to}>
                    <NavLink to={n.to} end={n.to === '/'}>
                      <Icon name={n.icon} size={19} /> <span>{n.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="sidebar__foot">
          <div className="sidebar__user">
            <span className="avatar" aria-hidden="true">{iniciales(nombre)}</span>
            <div>
              <p className="sidebar__who">{nombre}</p>
              <p className="sidebar__role">{detalle}</p>
            </div>
          </div>
          {usuario.partner?.esLiderRegional && usuario.rol !== 'lider_regional' && (
            <p className="sidebar__badge"><Icon name="map" size={14} /> También Líder Regional</p>
          )}
          <button type="button" className="sidebar__switch" onClick={cerrarSesion}>
            <Icon name="logout" size={18} /> Cerrar sesión
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
          <p className="topbar__crumb"><span>TUPLUS Partners</span><Icon name="chevronRight" size={14} /><strong>{actual?.label || 'Portal'}</strong></p>
          <div className="topbar__right">
            {usuario.partner && (
              <p className="topbar__territory"><Icon name="map" size={15} /> {usuario.partner.territorio || 'Sin territorio'}</p>
            )}
            <span className="avatar avatar--sm" title={nombre} aria-hidden="true">{iniciales(nombre)}</span>
          </div>
        </header>
        <main className="app__main" id="contenido" tabIndex={-1}>
          <ErrorBoundary clave={location.pathname}><Outlet /></ErrorBoundary>
        </main>
      </div>

      <nav className="tabbar" aria-label="Navegación rápida">
        {barraInferior.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}>
            <Icon name={n.icon} size={22} /><span>{n.corto}</span>
          </NavLink>
        ))}
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir el menú completo">
          <Icon name="menu" size={22} /><span>Más</span>
        </button>
      </nav>
    </div>
  )
}
