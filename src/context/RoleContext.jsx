import { createContext, useContext, useState } from 'react'

// Rol de demostración. En la Etapa 1 esto vendrá del inicio de sesión real (backend con roles).
const RoleContext = createContext(null)
const KEY = 'tuplus-portal-rol'

function readRole() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(readRole)

  const setRole = (value) => {
    setRoleState(value)
    try { value ? localStorage.setItem(KEY, value) : localStorage.removeItem(KEY) } catch { /* sin almacenamiento */ }
  }

  // Datos de muestra del Partner que entra en la demostración
  const partner = { id: 'P-014', name: 'Partner de muestra', level: 'L2', territory: 'Barranca' }

  return <RoleContext.Provider value={{ role, setRole, partner }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
