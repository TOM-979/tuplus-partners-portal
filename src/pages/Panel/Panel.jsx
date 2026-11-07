import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Panel.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import LevelLadder from '../../components/LevelLadder/LevelLadder.jsx'
import ProgressBar from '../../components/ProgressBar/ProgressBar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, ErrorEstado, Vacio } from '../../components/Estado/Estado.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, ApiError } from '../../lib/api.js'

const ETAPA_NOMBRE = { contacto: 'Primer contacto', diagnostico: 'Diagnóstico', propuesta: 'Propuesta', negociacion: 'Negociación', cierre: 'Cierre', posventa: 'Posventa' }
const money = (n) => (n ? `USD ${Number(n).toLocaleString('es-PE')}` : 'Por cotizar')

export default function Panel() {
  const { usuario } = useAuth()
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const [perfil, setPerfil] = useState(null)
  const [oportunidades, setOportunidades] = useState([])
  const [cursos, setCursos] = useState([])

  const cargar = () => {
    setEstado({ cargando: true, error: '' })
    Promise.all([api.get('/perfil'), api.get('/crm'), api.get('/academia/cursos')])
      .then(([p, o, c]) => { setPerfil(p.dato); setOportunidades(o.datos); setCursos(c.datos) })
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudo cargar el panel.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando tu panel…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  const activas = oportunidades.filter((o) => !['cierre', 'posventa'].includes(o.etapa))
  const enNegociacion = oportunidades.filter((o) => o.etapa === 'negociacion').length
  const pipeline = oportunidades.filter((o) => o.monto && o.etapa !== 'posventa').reduce((s, o) => s + Number(o.monto), 0)
  const totalLecciones = cursos.reduce((s, c) => s + c.total_lecciones, 0)
  const leccionesHechas = cursos.reduce((s, c) => s + c.lecciones_completadas, 0)
  const cursoSiguiente = cursos.find((c) => c.lecciones_completadas < c.total_lecciones)

  return (
    <>
      <PageHeader title={`Hola, ${usuario.partner.nombre}`} description="Tu avance, tus oportunidades y lo que toca hacer esta semana."
        actions={<Link className="btn btn-primary" to="/crm">Registrar oportunidad</Link>} />

      <div className="panel-grid">
        <section className="card panel-rank" aria-labelledby="rango">
          <div className="panel-rank__head">
            <div>
              <p className="muted">Tu rango actual</p>
              <h2 id="rango">{usuario.partner.nivel} · {nombreNivel(usuario.partner.nivel)}</h2>
            </div>
            <Badge tone="gold">Código {usuario.partner.codigo}</Badge>
          </div>
          <LevelLadder current={usuario.partner.nivel} size="sm" />
          {perfil?.partner?.siguienteNivel && (
            <p className="panel-rank__next"><strong>Siguiente nivel:</strong> {perfil.partner.siguienteNivel.codigo} · {perfil.partner.siguienteNivel.nombre}</p>
          )}
          <Link to="/niveles" className="panel-link">Ver todos los niveles</Link>
        </section>

        <div className="panel-stats">
          <StatCard label="Oportunidades activas" value={activas.length} />
          <StatCard label="En negociación" value={enNegociacion} />
          <StatCard label="Monto en proceso" value={money(pipeline)} note="Propuestas con monto registrado" />
          <StatCard label="Avance en la Academia" value={totalLecciones ? `${Math.round((leccionesHechas / totalLecciones) * 100)}%` : '—'} note={totalLecciones ? `${leccionesHechas} de ${totalLecciones} lecciones` : 'Sin cursos todavía'} />
        </div>

        <section className="card" aria-labelledby="pendientes">
          <h2 id="pendientes">Tus oportunidades activas</h2>
          {activas.length === 0
            ? <Vacio titulo="Sin oportunidades activas" texto="Registra tu primera oportunidad desde el CRM." icono="briefcase" />
            : (
              <ul className="panel-list">
                {activas.map((o) => (
                  <li key={o.id}>
                    <div>
                      <p className="panel-list__title">{o.proximo_paso || 'Define el siguiente paso en el CRM'}</p>
                      <p className="muted">{o.empresa}{o.necesidad ? ` · ${o.necesidad}` : ''}</p>
                    </div>
                    <Badge tone="info">{ETAPA_NOMBRE[o.etapa]}</Badge>
                  </li>
                ))}
              </ul>
            )}
        </section>

        <section className="card" aria-labelledby="formacion">
          <h2 id="formacion">Sigue tu formación</h2>
          {cursoSiguiente ? (
            <div className="panel-module">
              <p className="panel-list__title">{cursoSiguiente.titulo}</p>
              <p className="muted">Nivel {cursoSiguiente.nivel}</p>
              <ProgressBar value={cursoSiguiente.lecciones_completadas} max={cursoSiguiente.total_lecciones} label={`Avance de ${cursoSiguiente.titulo}`} />
              <Link className="btn btn-ghost" to="/academia">Continuar curso</Link>
            </div>
          ) : (
            <Vacio titulo="Ya completaste los cursos disponibles" texto="Cuando subas de nivel se habilitarán más cursos." icono="book" />
          )}
          <div className="panel-locked">
            <Icon name="lock" size={18} />
            <p><strong>Comisiones:</strong> se mostrarán cuando la Dirección, Legal y Contabilidad aprueben el esquema.</p>
          </div>
        </section>
      </div>
    </>
  )
}

function nombreNivel(codigo) {
  const nombres = { L0: 'Postulante', L1: 'Candidato en formación', L2: 'Socio Comercial TUPLUS', L3: 'Consultor B2B TUPLUS', L4: 'Senior Partner TUPLUS', L5: 'MASTER PARTNER TUPLUS', L6: 'Líder Regional TUPLUS' }
  return nombres[codigo] || codigo
}
