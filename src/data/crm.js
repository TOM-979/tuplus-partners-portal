// CRM B2B: etapas desde el primer contacto hasta la posventa.
// Empresas y montos son de muestra; no son clientes reales.
export const stages = [
  { id: 'contacto', name: 'Primer contacto' },
  { id: 'diagnostico', name: 'Diagnóstico' },
  { id: 'propuesta', name: 'Propuesta' },
  { id: 'negociacion', name: 'Negociación' },
  { id: 'cierre', name: 'Cierre' },
  { id: 'posventa', name: 'Posventa' },
]

export const CURRENT_PARTNER = 'P-014'

export const opportunities = [
  { id: 'OP-101', company: 'Empresa de muestra A', sector: 'Educación', city: 'Barranca', need: 'Página web', stage: 'contacto', partner: 'P-014', amount: null, next: 'Agendar diagnóstico' },
  { id: 'OP-102', company: 'Empresa de muestra B', sector: 'Salud', city: 'Huacho', need: 'Automatización de citas', stage: 'diagnostico', partner: 'P-014', amount: null, next: 'Enviar resumen del diagnóstico' },
  { id: 'OP-103', company: 'Empresa de muestra C', sector: 'Comercio', city: 'Lima', need: 'Tienda en línea', stage: 'propuesta', partner: 'P-022', amount: 2400, next: 'Revisar propuesta con Dirección Comercial' },
  { id: 'OP-104', company: 'Empresa de muestra D', sector: 'Legal', city: 'Lima', need: 'Sistema de expedientes', stage: 'negociacion', partner: 'P-014', amount: 5200, next: 'Responder observaciones de alcance' },
  { id: 'OP-105', company: 'Empresa de muestra E', sector: 'Transporte', city: 'Supe', need: 'Datos y seguridad', stage: 'cierre', partner: 'P-031', amount: 3100, next: 'Firmar orden de servicio' },
  { id: 'OP-106', company: 'Empresa de muestra F', sector: 'Restaurantes', city: 'Barranca', need: 'Página web', stage: 'posventa', partner: 'P-014', amount: 900, next: 'Encuesta de satisfacción' },
  { id: 'OP-107', company: 'Empresa de muestra G', sector: 'Inmobiliaria', city: 'Lima', need: 'Commerce', stage: 'contacto', partner: 'P-022', amount: null, next: 'Primera llamada' },
]
