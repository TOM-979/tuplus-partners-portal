// Territorios iniciales según WEB-02 (sección 10.1). Estados y cupos son de muestra:
// la decisión D8 (convocatorias abiertas al lanzamiento) sigue pendiente.
export const territoryStates = {
  abierta: { label: 'Convocatoria abierta', tone: 'ok' },
  revision: { label: 'Revisión en curso', tone: 'info' },
  proximamente: { label: 'Próximamente', tone: 'warn' },
  cerrada: { label: 'Convocatoria cerrada', tone: 'neutral' },
  activa: { label: 'Operación activa', tone: 'gold' },
}

export const territories = [
  { id: 'barranca', name: 'Barranca', region: 'Lima Provincias', state: 'abierta', partners: 3, capacity: 8, owner: '[Responsable territorial]' },
  { id: 'norte-chico', name: 'Norte Chico', region: 'Lima Provincias', state: 'revision', partners: 2, capacity: 6, owner: '[Responsable territorial]' },
  { id: 'lima', name: 'Lima Metropolitana', region: 'Lima', state: 'abierta', partners: 5, capacity: 15, owner: '[Responsable territorial]' },
  { id: 'piloto-3', name: 'Tercera zona piloto', region: 'Por definir', state: 'proximamente', partners: 0, capacity: 0, owner: 'Por definir' },
]
