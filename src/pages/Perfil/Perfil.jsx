import './Perfil.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { useEffect, useState } from 'react'
import { useRole } from '../../context/RoleContext.jsx'
import { levels } from '../../data/levels.js'
import { modules } from '../../data/academy.js'

// Perfil, código y permisos del Partner
export default function Perfil() {
  const { partner } = useRole()
  const [authorized, setAuthorized] = useState(false)
  const [denied, setDenied] = useState('')
  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' }).then(async (response) => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setAuthorized(true)
    }).catch((error) => setDenied(error.message))
  }, [])
  if (denied) return <p role="alert">{denied}</p>
  if (!authorized) return <p>Cargando perfil…</p>
  const level = levels.find((l) => l.code === partner.level)
  const certs = modules.filter((m) => m.certificate)

  const rows = [
    ['Código de Partner', partner.id],
    ['Rango', `${level.code} · ${level.name}`],
    ['Función territorial', 'Ninguna'],
    ['Territorio asignado', partner.territory],
    ['Estado', 'Partner activo'],
    ['Vigencia del rango', '[Fecha por definir]'],
  ]

  return (
    <>
      <PageHeader title="Mi perfil" description="Tus datos internos en la Red. Los cambios de rango y territorio los hace la Dirección, con registro de cada cambio."
        actions={<button type="button" className="btn btn-ghost" disabled title="Disponible en la Etapa 1">Editar datos de contacto</button>} />
      <div className="profile-grid">
        <section className="card" aria-labelledby="identidad">
          <h2 id="identidad">Identificación</h2>
          <dl className="profile-dl">
            {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>

        <section className="card" aria-labelledby="permisos">
          <h2 id="permisos">Lo que puedes hacer</h2>
          <ul className="profile-perms">
            {level.can.map((c) => <li key={c} className="is-yes"><Icon name="check" size={18} /> {c}</li>)}
            {level.cannot.map((c) => <li key={c} className="is-no"><Icon name="lock" size={18} /> {c}</li>)}
          </ul>
          <p className="muted profile-note">En el CRM solo ves las empresas y oportunidades que tú registraste.</p>
        </section>

        <section className="card" aria-labelledby="certificados">
          <h2 id="certificados">Certificados</h2>
          <ul className="profile-certs">
            {certs.map((m) => (
              <li key={m.id}><Icon name="award" /> <span>{m.title}</span> <Badge tone="ok">Vigente</Badge></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
