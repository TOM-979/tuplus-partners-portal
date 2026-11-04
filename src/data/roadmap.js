// Etapas del Sistema Master Partner (mensaje de Dirección General) y lo que cubre esta base.
export const stagesPlan = [
  { n: 1, title: 'Portal, usuarios y seguridad', items: ['Registro y perfiles', 'Códigos y niveles L0–L6', 'Roles y permisos'], base: 'Pantallas de acceso, registro, perfil, niveles y cambio de vista por rol.' },
  { n: 2, title: 'Academia Comercial', items: ['Módulos de capacitación', 'Evaluaciones', 'Certificaciones'], base: 'Pantalla de Academia con módulos por nivel, avance y certificados.' },
  { n: 3, title: 'CRM Comercial B2B', items: ['Empresas y contactos', 'Oportunidades', 'Negociación y ventas'], base: 'Tablero de oportunidades por etapa con filtro por permisos.' },
  { n: 4, title: 'Gestión ejecutiva', items: ['Comisiones', 'Reportes', 'Supervisión regional', 'Posventa'], base: 'Panel de Dirección con embudo, territorios y bandeja de revisión. Comisiones bloqueadas hasta aprobación.' },
]

export const architecture = [
  { name: 'Web corporativa TUPLUS', tech: 'Astro · Hostinger', role: 'Servicios, portafolio, cotizador y captación de Partners', state: 'Existe' },
  { name: 'Portal TUPLUS Partners', tech: 'React + Vite (esta base) · Node.js / Express', role: 'Registro, niveles, panel comercial y acceso a la Academia', state: 'Base creada' },
  { name: 'API segura de integración', tech: 'Node.js / Express', role: 'Une la web, el portal, el CRM y la Academia', state: 'Por construir' },
  { name: 'CRM', tech: 'EspoCRM (por evaluar)', role: 'Empresas, contactos y oportunidades con su propia base de datos', state: 'Por evaluar' },
  { name: 'Academia', tech: 'Módulo propio; Moodle como evolución', role: 'Capacitación, evaluaciones y certificados', state: 'Por evaluar' },
  { name: 'Capa de datos y seguridad', tech: 'MySQL', role: 'Bases separadas, permisos, auditoría y respaldos', state: 'Por construir' },
]
