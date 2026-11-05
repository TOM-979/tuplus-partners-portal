import { createContext, useContext, useEffect, useState } from 'react'

// Rol de demostración. En la Etapa 1 esto vendrá del inicio de sesión real (backend con roles).
const RoleContext = createContext(null)
export function RoleProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setUser(data?.user || null))
      .catch(() => setUser(null))
      .finally(() => setReady(true))
  }, [])

  const login = async (email, password) => {
    const response = await fetch('/api/session', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await fetch('/api/session', { method: 'DELETE', credentials: 'include' })
    setUser(null)
  }

  return <RoleContext.Provider value={{ role: user?.role || null, user, partner: user, login, logout, ready }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
