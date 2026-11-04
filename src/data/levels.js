// Rangos de la Red de Socios según TUPLUS WEB-02 (sección 5.2).
// L6 se muestra como "Líder Regional": en WEB-02 es una función territorial, no un rango.
// Por confirmar en la reunión técnica.
export const levels = [
  {
    code: 'L0', name: 'Postulante', kind: 'rango',
    summary: 'Envió su postulación. Todavía no pertenece a TUPLUS.',
    can: ['Ver el estado de su postulación'],
    cannot: ['Representar a TUPLUS', 'Cotizar'],
    next: 'Superar el filtro inicial de revisión humana.',
  },
  {
    code: 'L1', name: 'Candidato en formación', kind: 'rango',
    summary: 'Pasó el filtro y está en formación inicial.',
    can: ['Acceder a la formación inicial de la Academia'],
    cannot: ['Representar a TUPLUS', 'Cotizar'],
    next: 'Completar la formación inicial, la simulación y la entrevista.',
  },
  {
    code: 'L2', name: 'Socio Comercial TUPLUS', kind: 'rango',
    summary: 'Aprobado y activado para originar y registrar oportunidades.',
    can: ['Registrar oportunidades en el CRM', 'Usar materiales comerciales aprobados'],
    cannot: ['Modificar precios', 'Diseñar soluciones'],
    next: 'Primeras oportunidades registradas con calidad y conducta sostenida.',
  },
  {
    code: 'L3', name: 'Consultor B2B TUPLUS', kind: 'rango',
    summary: 'Hace el diagnóstico inicial con la metodología TUPLUS.',
    can: ['Diagnóstico inicial bajo metodología'],
    cannot: ['Diseñar la solución', 'Modificar precios'],
    next: 'Resultados cobrados y documentación completa en el CRM.',
  },
  {
    code: 'L4', name: 'Senior Partner TUPLUS', kind: 'rango',
    summary: 'Resultados cobrados, documentación, calidad y conducta sostenidas.',
    can: ['Acompañar a socios de rangos anteriores'],
    cannot: ['Asignar territorios'],
    next: 'Experiencia, dominio, liderazgo y cartera de calidad.',
  },
  {
    code: 'L5', name: 'MASTER PARTNER TUPLUS', kind: 'rango',
    summary: 'Rango avanzado por mérito: experiencia, liderazgo y formación continua.',
    can: ['Liderar equipos comerciales', 'Formar a otros socios'],
    cannot: ['Reemplazar a la Dirección Comercial'],
    next: 'El ascenso por mérito termina aquí. El liderazgo territorial es una función aparte.',
  },
  {
    code: 'L6', name: 'Líder Regional TUPLUS', kind: 'funcion',
    summary: 'Función territorial por nombramiento. Puede coexistir con un rango, pero no lo reemplaza.',
    can: ['Coordinar un territorio', 'Supervisar socios de su zona'],
    cannot: ['Decidir comisiones', 'Aprobar sin la Dirección'],
    next: 'Se asigna y se revoca por decisión de la Dirección.',
  },
]
