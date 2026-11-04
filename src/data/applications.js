// Bandeja de revisión de postulaciones. Identificadores anónimos de muestra.
export const applicationStates = {
  recibida: { label: 'Postulación recibida', tone: 'info' },
  preseleccionado: { label: 'Preseleccionado', tone: 'ok' },
  aclaracion: { label: 'Aclaración pedida', tone: 'warn' },
  no_seleccionado: { label: 'No seleccionado', tone: 'neutral' },
}

export const applications = [
  { id: 'POST-0041', territory: 'Barranca', score: 82, state: 'recibida', date: '2026-11-02' },
  { id: 'POST-0042', territory: 'Lima Metropolitana', score: 64, state: 'recibida', date: '2026-11-02' },
  { id: 'POST-0043', territory: 'Norte Chico', score: 71, state: 'aclaracion', date: '2026-11-03' },
  { id: 'POST-0044', territory: 'Lima Metropolitana', score: 55, state: 'recibida', date: '2026-11-03' },
]
