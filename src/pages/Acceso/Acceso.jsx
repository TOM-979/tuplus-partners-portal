import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Acceso.css'
import Icon from '../../components/Icon/Icon.jsx'
import { useRole } from '../../context/RoleContext.jsx'

export default function Acceso() {
  const { login } = useRole()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const enter = async (email, password) => {
    try {
      const user = await login(email, password)
      navigate(user.role === 'partner' ? '/' : user.role === 'lider_regional' ? '/crm' : '/direccion')
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="access">
      <section className="access__intro">
        <h1>Portal TUPLUS Partners</h1>
        <p>El espacio privado de la Red de Socios Comerciales: tu nivel, tus oportunidades y tu formación en un solo lugar.</p>
        <ul className="access__points">
          <li><Icon name="ladder" /> Avanza de nivel por mérito, de L0 a MASTER PARTNER.</li>
          <li><Icon name="briefcase" /> Registra oportunidades y sigue cada una hasta la posventa.</li>
          <li><Icon name="book" /> Capacítate y certifícate en la Academia Comercial.</li>
        </ul>
        <p className="access__apply">¿Todavía no eres Partner? <Link to="/postulacion">Postula a la Red</Link></p>
      </section>

      <section className="card access__card" aria-labelledby="acceso-titulo">
        <h2 id="acceso-titulo">Entrar al portal</h2>
        <p className="access__note">
          <Icon name="lock" size={16} /> El inicio de sesión con usuario y contraseña llega en la Etapa 1, con roles y permisos en el servidor.
          Por ahora elige una vista de demostración.
        </p>
        <div className="access__roles">
          {error && <p role="alert" className="field__error">{error}</p>}
          <button type="button" className="access__role" onClick={() => enter('partner@tuplus.test', 'PartnerDemo2026!')}>
            <Icon name="user" size={24} />
            <span><strong>Entrar como Partner</strong><small>Panel comercial, CRM propio, Academia y nivel</small></span>
          </button>
          <button type="button" className="access__role" onClick={() => enter('lider@tuplus.test', 'LiderDemo2026!')}>
            <Icon name="map" size={24} />
            <span><strong>Entrar como Líder Regional</strong><small>Partners de su territorio</small></span>
          </button>
          <button type="button" className="access__role" onClick={() => enter('direccion@tuplus.test', 'DireccionDemo2026!')}>
            <Icon name="chart" size={24} />
            <span><strong>Entrar como Dirección</strong><small>Red de Partners, territorios, revisión y etapas</small></span>
          </button>
        </div>
      </section>
    </div>
  )
}
