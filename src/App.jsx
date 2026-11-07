import { Route, Routes, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout/AppLayout.jsx'
import PublicLayout from './layouts/PublicLayout/PublicLayout.jsx'
import Acceso from './pages/Acceso/Acceso.jsx'
import Registro from './pages/Registro/Registro.jsx'
import Panel from './pages/Panel/Panel.jsx'
import Perfil from './pages/Perfil/Perfil.jsx'
import Niveles from './pages/Niveles/Niveles.jsx'
import Academia from './pages/Academia/Academia.jsx'
import Crm from './pages/Crm/Crm.jsx'
import Direccion from './pages/Direccion/Direccion.jsx'
import Arquitectura from './pages/Arquitectura/Arquitectura.jsx'
import NoEncontrado from './pages/NoEncontrado/NoEncontrado.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { Cargando } from './components/Estado/Estado.jsx'
import AvisoConexion from './components/AvisoConexion/AvisoConexion.jsx'

// Rutas protegidas por rol. El servidor vuelve a validar cada permiso: esto solo oculta la pantalla.
function SoloPara({ roles, children }) {
  const { usuario } = useAuth()
  if (!roles.includes(usuario.rol)) return <Navigate to={usuario.rol === 'partner' ? '/' : '/direccion'} replace />
  return children
}

export default function App() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Cargando texto="Cargando el portal…" />
      </div>
    )
  }

  if (!usuario) {
    return (
      <>
        <AvisoConexion />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/acceso" element={<Acceso />} />
            <Route path="/postulacion" element={<Registro />} />
            <Route path="*" element={<Navigate to="/acceso" replace />} />
          </Route>
        </Routes>
      </>
    )
  }

  return (
    <>
      <AvisoConexion />
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/acceso" element={<Navigate to="/" replace />} />
        <Route path="/postulacion" element={<Registro />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route index element={<SoloPara roles={['partner']}><Panel /></SoloPara>} />
        <Route path="perfil" element={<SoloPara roles={['partner', 'lider_regional']}><Perfil /></SoloPara>} />
        <Route path="direccion" element={<SoloPara roles={['direccion', 'lider_regional']}><Direccion /></SoloPara>} />
        <Route path="arquitectura" element={<SoloPara roles={['direccion']}><Arquitectura /></SoloPara>} />
        <Route path="crm" element={<Crm />} />
        <Route path="academia" element={<SoloPara roles={['partner', 'lider_regional']}><Academia /></SoloPara>} />
        <Route path="niveles" element={<Niveles />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
      </Routes>
    </>
  )
}
