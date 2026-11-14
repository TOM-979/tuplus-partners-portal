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

  const orden = niveles.filter((l) => l.tipo === 'rango')
  const indice = orden.findIndex((l) => l.codigo === level.codigo)
  const esActual = current === level.codigo
  const avance = orden.length > 1 ? Math.round((Math.max(indice, 0) / (orden.length - 1)) * 100) : 0

  return (
    <>
      <PageHeader title="Niveles L0–L6" description="Se asciende por mérito: calidad, resultados cobrados, uso correcto del CRM, ética y liderazgo. Cada ascenso lo decide la Dirección y queda en tu historial." />

      <section className="levels-stage" aria-labelledby="escalera">
        <div className="levels-stage__head">
          <h2 id="escalera">La escalera de la Red</h2>
          <p>Toca un nivel para ver qué puedes hacer en él y cómo se llega al siguiente.</p>
        </div>
        <div className="levels-stage__ladder">
          <LevelLadder current={current} selected={selected} onSelect={setSelected} size="lg" />
        </div>
        {current && <p className="levels-stage__you"><Icon name="target" size={16} /> Tu rango actual es <strong>{current}</strong></p>}
      </section>

      <div className="levels-grid">
        <section className="card levels-detail" key={level.codigo} aria-live="polite" aria-labelledby="detalle">
          <div className="levels-detail__head">
            <span className="levels-detail__code" aria-hidden="true">{level.codigo}</span>
            <div>
              <h2 id="detalle">{level.nombre}</h2>
              <p className="muted">Nivel {indice + 1} de {orden.length}</p>
            </div>
            {esActual && <Badge tone="gold">Tu rango actual</Badge>}
          </div>
          <div className="levels-meter" role="img" aria-label={`Posición en la escalera: ${avance}%`}><i style={{ width: `${avance}%` }} /></div>
          <p className="levels-detail__desc">{level.descripcion}</p>
          <div className="levels-cols">
            <div className="levels-col levels-col--yes">
              <h3><Icon name="check" size={16} /> Puede</h3>
              <ul>{detalle.can.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div className="levels-col levels-col--no">
              <h3><Icon name="lock" size={16} /> Todavía no puede</h3>
              <ul>{detalle.cannot.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </div>
          {detalle.next && (
            <p className="levels-next"><span className="levels-next__icon"><Icon name="arrowRight" size={18} /></span><span><strong>Para avanzar:</strong> {detalle.next}</span></p>
          )}
        </section>

        <section className="levels-role" aria-labelledby="funcion">
          <span className="levels-role__icon"><Icon name="map" size={22} /></span>
          <Badge tone="gold">Función territorial</Badge>
          <h2 id="funcion">{leader.codigo} · {leader.nombre}</h2>
          <p>{leader.descripcion}</p>
          <ul>{detalleLider.can.map((c) => <li key={c}><Icon name="check" size={16} /> {c}</li>)}</ul>
          {usuario.partner?.esLiderRegional && <p className="levels-confirm"><Icon name="check" size={16} /> Tú tienes esta función además de tu rango.</p>}
        </section>
      </div>
    </>
  )
}
