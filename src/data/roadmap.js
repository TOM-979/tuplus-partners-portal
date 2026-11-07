// Etapas del Sistema Master Partner (mensaje de Dirección General) y lo que cubre esta entrega.
export const stagesPlan = [
  { n: 1, title: 'Portal, usuarios y seguridad', items: ['Registro y perfiles', 'Códigos y niveles L0–L6', 'Roles y permisos'], base: 'Acceso con contraseña y doble verificación, registro, perfil, niveles y permisos por rol — conectado a la API real.' },
  { n: 2, title: 'Academia Comercial', items: ['Módulos de capacitación', 'Evaluaciones', 'Certificaciones'], base: 'Cursos y lecciones por nivel, con avance por Partner guardado en la base de datos.' },
  { n: 3, title: 'CRM Comercial B2B', items: ['Empresas y contactos', 'Oportunidades', 'Negociación y ventas'], base: 'Tablero de oportunidades por etapa, con aislamiento por Partner/territorio validado en el servidor.' },
  { n: 4, title: 'Gestión ejecutiva', items: ['Comisiones', 'Reportes', 'Supervisión regional', 'Posventa'], base: 'Panel de Dirección con bandeja de revisión, activación de Partners, territorios y reportes reales. Comisiones bloqueadas hasta aprobación.' },
]

export const architecture = [
  { name: 'Web corporativa TUPLUS', tech: 'Astro · Hostinger', role: 'Servicios, portafolio, cotizador y captación de Partners', state: 'Existe' },
  { name: 'Portal TUPLUS Partners', tech: 'React + Vite · conectado a la API', role: 'Registro, niveles, panel comercial y Academia', state: 'Completo' },
  { name: 'API segura de integración', tech: 'Node.js / Express / MySQL', role: 'Une la web, el portal, el CRM y la Academia', state: 'Completo' },
  { name: 'CRM', tech: 'Módulo propio, dentro de la API', role: 'Oportunidades por Partner/territorio, con historial', state: 'Completo' },
  { name: 'Academia', tech: 'Módulo propio, dentro de la API', role: 'Cursos, lecciones y avance por Partner', state: 'Completo' },
  { name: 'Capa de datos y seguridad', tech: 'MySQL', role: 'Login, permisos, auditoría (historial de cambios) y respaldos', state: 'Completo' },
]
