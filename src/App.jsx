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
import { useRole } from './context/RoleContext.jsx'

// Rutas protegidas por rol (en la Etapa 1 el servidor también valida el permiso)
function OnlyFor({ role: needed, children }) {
  const { role } = useRole()
  if (role !== needed) return <Navigate to={role === 'direccion' ? '/direccion' : '/'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/acceso" element={<Acceso />} />
        <Route path="/postulacion" element={<Registro />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route index element={<OnlyFor role="partner"><Panel /></OnlyFor>} />
        <Route path="perfil" element={<OnlyFor role="partner"><Perfil /></OnlyFor>} />
        <Route path="direccion" element={<OnlyFor role="direccion"><Direccion /></OnlyFor>} />
        <Route path="arquitectura" element={<OnlyFor role="direccion"><Arquitectura /></OnlyFor>} />
        <Route path="crm" element={<Crm />} />
        <Route path="academia" element={<Academia />} />
        <Route path="niveles" element={<Niveles />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
