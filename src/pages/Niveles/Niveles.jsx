import { useEffect, useState } from 'react'
import './Niveles.css'
import PageHeader from '../../components/PageHeader/PageHeader.jsx'
import LevelLadder from '../../components/LevelLadder/LevelLadder.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { Cargando, ErrorEstado } from '../../components/Estado/Estado.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api, ApiError } from '../../lib/api.js'

// Lo que puede y no puede hacer cada rango, según WEB-02 (sección 5.2). Es texto descriptivo
// de las reglas del documento, no un dato que cambie por Partner, así que vive aquí.
const DETALLE = {
  L0: { can: ['Ver el estado de su postulación'], cannot: ['Representar a TUPLUS', 'Cotizar'], next: 'Superar el filtro inicial de revisión humana.' },
  L1: { can: ['Acceder a la formación inicial de la Academia'], cannot: ['Representar a TUPLUS', 'Cotizar'], next: 'Completar la formación inicial, la simulación y la entrevista.' },
  L2: { can: ['Registrar oportunidades en el CRM', 'Usar materiales comerciales aprobados'], cannot: ['Modificar precios', 'Diseñar soluciones'], next: 'Primeras oportunidades registradas con calidad y conducta sostenida.' },
  L3: { can: ['Diagnóstico inicial bajo metodología'], cannot: ['Diseñar la solución', 'Modificar precios'], next: 'Resultados cobrados y documentación completa en el CRM.' },
  L4: { can: ['Acompañar a socios de rangos anteriores'], cannot: ['Asignar territorios'], next: 'Experiencia, dominio, liderazgo y cartera de calidad.' },
  L5: { can: ['Liderar equipos comerciales', 'Formar a otros socios'], cannot: ['Reemplazar a la Dirección Comercial'], next: 'El ascenso por mérito termina aquí. El liderazgo territorial es una función aparte.' },
  L6: { can: ['Coordinar un territorio', 'Supervisar socios de su zona'], cannot: ['Decidir comisiones', 'Aprobar sin la Dirección'], next: 'Se asigna y se revoca por decisión de la Dirección.' },
}

export default function Niveles() {
  const { usuario } = useAuth()
  const [niveles, setNiveles] = useState(null)
  const [estado, setEstado] = useState({ cargando: true, error: '' })
  const current = usuario.partner?.nivel || null
  const [selected, setSelected] = useState(current || 'L0')

  const cargar = () => {
    setEstado({ cargando: true, error: '' })
    api.get('/niveles', { auth: false })
      .then((r) => setNiveles(r.datos))
      .catch((err) => setEstado({ cargando: false, error: err instanceof ApiError ? err.message : 'No se pudieron cargar los niveles.' }))
      .finally(() => setEstado((e) => ({ ...e, cargando: false })))
  }
  useEffect(cargar, [])

  if (estado.cargando) return <div className="card"><Cargando texto="Cargando los niveles…" /></div>
  if (estado.error) return <div className="card"><ErrorEstado mensaje={estado.error} onReintentar={cargar} /></div>

  const level = niveles.find((l) => l.codigo === selected)
  const leader = niveles.find((l) => l.tipo === 'funcion')
  const detalle = DETALLE[level.codigo] || { can: [], cannot: [], next: '' }
  const detalleLider = DETALLE[leader.codigo] || { can: [] }

  return (
    <>
      <PageHeader title="Niveles L0–L6" description="Se asciende por mérito: calidad, resultados cobrados, uso correcto del CRM, ética y liderazgo. Cada ascenso lo decide la Dirección y queda en tu historial." />

      <section className="card levels-ladder" aria-labelledby="escalera">
        <h2 id="escalera" className="visually-hidden">Escalera de rangos</h2>
        <LevelLadder current={current} selected={selected} onSelect={setSelected} size="lg" />
      </section>

      <div className="levels-grid">
        <section className="card levels-detail" aria-live="polite" aria-labelledby="detalle">
          <div className="levels-detail__head">
            <h2 id="detalle">{level.codigo} · {level.nombre}</h2>
            {current === level.codigo && <Badge tone="gold">Tu rango actual</Badge>}
          </div>
          <p>{level.descripcion}</p>
          <div className="levels-cols">
            <div>
              <h3>Puede</h3>
              <ul>{detalle.can.map((c) => <li key={c}><Icon name="check" size={18} /> {c}</li>)}</ul>
            </div>
            <div>
              <h3>No puede</h3>
              <ul className="is-no">{detalle.cannot.map((c) => <li key={c}><Icon name="lock" size={18} /> {c}</li>)}</ul>
            </div>
          </div>
          {detalle.next && <p className="levels-next"><strong>Siguiente paso:</strong> {detalle.next}</p>}
        </section>

        <section className="card levels-role" aria-labelledby="funcion">
          <Badge tone="info">Función territorial</Badge>
          <h2 id="funcion">{leader.codigo} · {leader.nombre}</h2>
          <p>{leader.descripcion}</p>
          <ul>{detalleLider.can.map((c) => <li key={c}><Icon name="map" size={18} /> {c}</li>)}</ul>
          {usuario.partner?.esLiderRegional && <p className="levels-confirm"><Icon name="check" size={16} /> Tú tienes esta función además de tu rango.</p>}
        </section>
      </div>
    </>
  )
}
