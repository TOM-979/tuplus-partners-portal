// Vista de revisión del frontend: datos ficticios, aislados en sessionStorage.
const KEY = "tuplus-frontend-preview-v1";
const ROLE = "tuplus-frontend-preview-role";
export const previewAvailable =
  import.meta.env.DEV || import.meta.env.VITE_FRONTEND_PREVIEW === "true";
export function isPreview() {
  try {
    return previewAvailable && sessionStorage.getItem(ROLE) !== null;
  } catch {
    return false;
  }
}
export function previewRole() {
  const role = sessionStorage.getItem(ROLE);
  return ["direccion", "partner", "lider_regional"].includes(role)
    ? role
    : "direccion";
}
export function enterPreview(role = "direccion") {
  sessionStorage.setItem(
    ROLE,
    ["direccion", "partner", "lider_regional"].includes(role)
      ? role
      : "direccion",
  );
}
export function leavePreview() {
  sessionStorage.removeItem(ROLE);
}
export function resetPreview() {
  sessionStorage.removeItem(KEY);
}
export const levels = [
  "Postulante",
  "Candidato en formación",
  "Socio Comercial TUPLUS",
  "Consultor B2B TUPLUS",
  "Senior Partner TUPLUS",
  "MASTER PARTNER TUPLUS",
  "Líder Regional TUPLUS",
].map((nombre, i) => ({
  id: i + 1,
  codigo: `L${i}`,
  nombre,
  tipo: i === 6 ? "funcion" : "rango",
  orden: i,
  descripcion:
    i === 6
      ? "Función territorial por nombramiento de Dirección."
      : "El avance se evalúa según resultados, formación y conducta.",
}));
const today = () => new Date().toISOString();
function initial() {
  const partners = [
    {
      id: 1,
      codigo: "P-001",
      nombre: "Valeria Mendoza",
      territorio: "Lima Metropolitana",
      territorio_id: 1,
      nivel: "L2",
      estado: "activo",
      es_lider_regional: false,
    },
    {
      id: 2,
      codigo: "P-002",
      nombre: "Diego Salazar",
      territorio: "Barranca",
      territorio_id: 2,
      nivel: "L3",
      estado: "activo",
      es_lider_regional: false,
    },
    {
      id: 3,
      codigo: "P-003",
      nombre: "Lucía Torres",
      territorio: "Lima Metropolitana",
      territorio_id: 1,
      nivel: "L4",
      estado: "activo",
      es_lider_regional: true,
    },
  ];
  const courses = [
    {
      id: 1,
      titulo: "Bienvenida a la Red TUPLUS",
      descripcion:
        "Conoce la red, el rol del socio comercial y las buenas prácticas para empezar.",
      nivel: "L1",
      nivel_id: 2,
      publicado: 1,
      lecciones: [
        {
          id: 11,
          titulo: "Tu rol como socio comercial",
          tipo: "lectura",
          duracion_min: 8,
          contenido:
            "Un socio comercial identifica necesidades y registra oportunidades de negocio. Su trabajo empieza por escuchar al cliente, comprender su contexto y documentar información útil.\n\nUsa los materiales comerciales aprobados y coordina las propuestas con el equipo responsable. Consulta tus atribuciones en Niveles L0–L6 antes de asumir compromisos.\n\nMantén el CRM actualizado: empresa, contacto, necesidad y próximo paso. La calidad del registro permite dar continuidad a cada relación.",
        },
        {
          id: 12,
          titulo: "Una relación comercial responsable",
          tipo: "lectura",
          duracion_min: 6,
          contenido:
            "Presenta información clara y verificable. Evita prometer plazos, precios o condiciones que no estén aprobados.\n\nRegistra los acuerdos y respeta la información del cliente. Si una solicitud excede tu alcance, consulta a tu líder o a Dirección.\n\nEl avance de nivel requiere una decisión de Dirección. Completar una capacitación acredita aprendizaje, pero no cambia automáticamente tu rango.",
        },
      ],
      preguntas: [
        {
          id: 1,
          texto: "¿Qué debe quedar registrado después del primer contacto?",
          opciones: [
            "Solo el nombre de la empresa",
            "La necesidad y un próximo paso claro",
            "Un precio sin validar",
          ],
          correcta: 1,
        },
        {
          id: 2,
          texto: "¿Quién decide los cambios de nivel?",
          opciones: [
            "Dirección",
            "El propio Partner",
            "El sistema al completar un curso",
          ],
          correcta: 0,
        },
      ],
      minimo: 70,
    },
    {
      id: 2,
      titulo: "Diagnóstico comercial B2B",
      descripcion:
        "Convierte una conversación en una oportunidad bien documentada.",
      nivel: "L2",
      nivel_id: 3,
      publicado: 1,
      lecciones: [
        {
          id: 21,
          titulo: "Escuchar antes de proponer",
          tipo: "lectura",
          duracion_min: 12,
          contenido:
            "Explora la situación actual, el problema que la empresa quiere resolver y las consecuencias de mantenerlo.\n\nPregunta quién participa en la decisión, qué restricciones existen y cuál sería un resultado útil. Resume lo que entendiste y valida tu resumen con el contacto.\n\nDocumenta hechos separados de supuestos. Define el próximo paso con una persona responsable y una fecha.",
        },
        {
          id: 22,
          titulo: "Del diagnóstico al seguimiento",
          tipo: "lectura",
          duracion_min: 10,
          contenido:
            "Una oportunidad necesita continuidad. Registra una llamada, reunión o nota y conserva los compromisos asumidos.\n\nActualiza la etapa cuando exista evidencia del avance. Los importes del CRM son estimaciones comerciales y deben conservar su moneda.\n\nEn posventa, verifica la entrega y registra pendientes para coordinar su resolución.",
        },
      ],
      preguntas: [
        {
          id: 1,
          texto: "¿Qué caracteriza un buen próximo paso?",
          opciones: [
            "Tiene responsable y fecha",
            "Es una intención sin plazo",
            "Se comunica solo de palabra",
          ],
          correcta: 0,
        },
      ],
      minimo: 70,
    },
    {
      id: 3,
      titulo: "Negociación y propuestas de valor",
      descripcion: "Borrador para preparar el siguiente módulo de la Academia.",
      nivel: "L3",
      nivel_id: 4,
      publicado: 0,
      lecciones: [
        {
          id: 31,
          titulo: "Preparar una propuesta",
          tipo: "lectura",
          duracion_min: 15,
          contenido:
            "Relaciona cada propuesta con una necesidad validada. Revisa las condiciones con el equipo responsable antes de presentarlas.",
        },
      ],
      preguntas: [
        {
          id: 1,
          texto: "¿Qué debe respaldar una propuesta?",
          opciones: ["Una necesidad validada", "Una suposición"],
          correcta: 0,
        },
      ],
      minimo: 70,
    },
  ];
  const names = [
    "Clínica Horizonte",
    "Estudio Legal Ríos",
    "Comercial Andina",
    "Colegio Nuevo Norte",
    "Nova Salud",
    "Grupo Costa",
  ];
  const etapas = [
    "contacto",
    "diagnostico",
    "propuesta",
    "negociacion",
    "cierre",
    "posventa",
  ];
  const oportunidades = names.map((empresa, i) => {
    const p = partners[i === 1 ? 1 : 0];
    return {
      id: i + 1,
      codigo: `OP-${String(i + 1).padStart(4, "0")}`,
      empresa,
      contacto: [
        "Ana Pérez",
        "Jorge Ríos",
        "Paula Díaz",
        "José Ramos",
        "Carmen Vega",
        "Luis Soto",
      ][i],
      sector: i % 2 ? "Servicios" : "Salud",
      ciudad: p.territorio,
      necesidad: [
        "Presencia digital",
        "Captación de clientes",
        "Catálogo comercial",
      ][i % 3],
      partner_id: p.id,
      partner_codigo: p.codigo,
      partner_nombre: p.nombre,
      territorio: p.territorio,
      territorio_id: p.territorio_id,
      etapa: etapas[i],
      monto: [null, 1800, 3500, 5200, 2800, 6400][i],
      moneda: i === 2 ? "USD" : "PEN",
      proximo_paso: [
        "Agendar primera reunión",
        "Validar necesidad",
        "Revisar propuesta",
        "Confirmar condiciones",
        "Coordinar entrega",
        "Revisar satisfacción",
      ][i],
      creado_en: today(),
      actualizado_en: today(),
    };
  });
  return {
    partners,
    courses,
    oportunidades,
    empresas: [
      {
        id: 1,
        partner_id: 1,
        partner_codigo: "P-001",
        nombre: "Clínica Horizonte",
        sector: "Salud",
        ciudad: "Lima Metropolitana",
        contactos: [
          {
            id: 1,
            nombre: "Ana Pérez",
            cargo: "Administración",
            correo: "ana@example.com",
            telefono: "+51 900 000 001",
          },
        ],
      },
      {
        id: 2,
        partner_id: 2,
        partner_codigo: "P-002",
        nombre: "Estudio Legal Ríos",
        sector: "Legal",
        ciudad: "Barranca",
        contactos: [],
      },
    ],
    progreso: { 1: [11] },
    intentos: [],
    certificados: [],
    seguimientos: [
      {
        id: 1,
        oportunidad_id: 6,
        usuario_id: 1,
        autor: "partner@example.com",
        tipo: "posventa",
        detalle:
          "Confirmar que la entrega responde a lo acordado y registrar observaciones del cliente.",
        fecha: "2026-11-12",
        estado: "pendiente",
        creado_en: today(),
      },
      {
        id: 2,
        oportunidad_id: 4,
        usuario_id: 1,
        autor: "partner@example.com",
        tipo: "reunion",
        detalle:
          "Revisar las condiciones de la propuesta con el contacto responsable.",
        fecha: "2026-11-11",
        estado: "pendiente",
        creado_en: today(),
      },
    ],
    comisiones: [
      {
        id: 1,
        oportunidad_id: 5,
        monto: 180,
        moneda: "PEN",
        sustento: "Importe de ejemplo pendiente de revisión de Dirección.",
        estado: "pendiente",
        referencia: null,
        creado_en: today(),
      },
    ],
    postulaciones: [
      {
        id: 1,
        codigo: "POST-0001",
        nombre: "Mariana Castro",
        correo: "mariana@example.com",
        territorio: "Lima Metropolitana",
        territorio_id: 1,
        estado: "recibida",
        creado_en: today(),
      },
      {
        id: 2,
        codigo: "POST-0002",
        nombre: "Jorge Fernández",
        correo: "jorge@example.com",
        territorio: "Barranca",
        territorio_id: 2,
        estado: "preseleccionado",
        creado_en: today(),
      },
    ],
    territorios: [
      {
        id: 1,
        nombre: "Lima Metropolitana",
        region: "Lima",
        estado: "abierta",
        capacidad: 20,
      },
      {
        id: 2,
        nombre: "Barranca",
        region: "Lima",
        estado: "abierta",
        capacidad: 10,
      },
    ],
    historial: [],
  };
}
function read() {
  try {
    const saved = sessionStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : initial();
  } catch {
    return initial();
  }
}
function save(s) {
  sessionStorage.setItem(KEY, JSON.stringify(s));
}
function next(list) {
  return Math.max(0, ...list.map((x) => x.id)) + 1;
}
export function previewUser() {
  const s = read(),
    rol = previewRole();
  return {
    id: rol === "direccion" ? 100 : rol === "lider_regional" ? 3 : 1,
    correo: `${rol}@example.com`,
    rol,
    partner:
      rol === "direccion"
        ? null
        : {
            ...s.partners[rol === "lider_regional" ? 2 : 0],
            esLiderRegional: rol === "lider_regional",
          },
  };
}
function visible(u, o) {
  return (
    u.rol === "direccion" ||
    (u.rol === "lider_regional"
      ? o.territorio_id === u.partner.territorio_id
      : o.partner_id === u.partner.id)
  );
}
function enrich(s, o) {
  const p = s.partners.find((p) => p.id === o.partner_id);
  return {
    ...o,
    partner_codigo: p.codigo,
    partner_nombre: p.nombre,
    territorio: p.territorio,
    territorio_id: p.territorio_id,
  };
}
export async function previewRequest(
  path,
  { method = "GET", body = {} } = {},
  ApiError = Error,
) {
  const s = read(),
    u = previewUser(),
    b = body || {},
    pid = u.partner?.id || 0;
  const fail = (text, status = 400) => {
    throw new ApiError(status, text);
  };
  const requireAdmin = () => {
    if (u.rol !== "direccion")
      fail("Esta acción está disponible para Dirección.", 403);
  };
  const ops = () =>
    s.oportunidades.map((o) => enrich(s, o)).filter((o) => visible(u, o));
  const courseList = () =>
    s.courses
      .filter(
        (c) =>
          u.rol === "direccion" ||
          (c.publicado &&
            Number(c.nivel.slice(1)) <= Number(u.partner.nivel.slice(1))),
      )
      .map((c) => ({
        ...c,
        total_lecciones: c.lecciones.length,
        lecciones_completadas: c.lecciones.filter((l) =>
          (s.progreso[pid] || []).includes(l.id),
        ).length,
        tiene_evaluacion: c.preguntas.length > 0,
      }));
  const course = (id) => {
    const c = courseList().find((c) => c.id === id);
    if (!c) fail("Curso no disponible.", 404);
    return c;
  };
  let result, m;
  if (path === "/niveles") return { datos: levels };
  if (path === "/territorios") return { datos: s.territorios };
  if (path === "/auth/yo") return { dato: u };
  if (path === "/auth/contrasena") {
    if (!b.nueva || b.nueva.length < 8)
      fail("Usa una contraseña de al menos 8 caracteres.");
    return {
      mensaje: "Cambio simulado. No se modificó ninguna contraseña real.",
    };
  }
  if (path === "/perfil")
    return {
      dato: {
        ...u,
        partner: {
          ...u.partner,
          siguienteNivel: levels.find(
            (n) => n.orden === Number(u.partner?.nivel.slice(1)) + 1,
          ),
        },
      },
    };
  if (path === "/perfil/historial")
    return {
      datos: [
        {
          accion: "activado",
          valor_nuevo: "P-001 · L2",
          creado_en: today(),
          motivo: "Registro de ejemplo para revisión del frontend.",
        },
      ],
    };
  if (path === "/academia/cursos") return { datos: courseList() };
  if (path === "/etapas/cursos" && method === "GET")
    return { dato: courseList() };
  if (path === "/etapas/cursos" && method === "POST") {
    requireAdmin();
    if (
      !b.titulo?.trim() ||
      !b.nivelId ||
      !b.lecciones?.length ||
      b.preguntas.some(
        (q) => !q.texto.trim() || q.opciones.some((o) => !o.trim()),
      )
    )
      fail("Completa el curso, sus lecciones y las preguntas.");
    const id = next(s.courses);
    s.courses.push({
      ...b,
      id,
      nivel: b.nivelId,
      nivel_id: levels.find((n) => n.codigo === b.nivelId)?.id,
      publicado: 0,
      lecciones: b.lecciones.map((l, i) => ({ ...l, id: id * 100 + i })),
      preguntas: b.preguntas.map((q, i) => ({ ...q, id: i + 1 })),
      minimo: Number(b.minimo),
    });
    result = { id };
  } else if ((m = path.match(/^\/etapas\/cursos\/(\d+)$/))) {
    const c = course(Number(m[1]));
    if (method === "PATCH") {
      requireAdmin();
      s.courses.find((x) => x.id === c.id).publicado = b.publicado ? 1 : 0;
      result = { mensaje: "Catálogo actualizado." };
    } else
      return {
        dato: {
          ...c,
          lecciones: c.lecciones.map((l) => ({
            ...l,
            completada: (s.progreso[pid] || []).includes(l.id),
          })),
          intentos: s.intentos
            .filter((i) => i.partner_id === pid && i.curso_id === c.id)
            .slice(-5)
            .reverse(),
          evaluacion: {
            minimo: c.minimo,
            preguntas: c.preguntas.map(({ correcta, ...q }) =>
              u.rol === "direccion" ? { ...q, correcta } : q,
            ),
          },
        },
      };
  } else if ((m = path.match(/^\/etapas\/cursos\/(\d+)\/contenido$/))) {
    requireAdmin();
    const c = s.courses.find((c) => c.id === Number(m[1]));
    if (!c || c.publicado) fail("Solo se editan cursos en borrador.");
    Object.assign(c, b, {
      id: c.id,
      nivel: b.nivelId,
      publicado: 0,
      lecciones: b.lecciones.map((l, i) => ({ ...l, id: c.id * 100 + i })),
      preguntas: b.preguntas.map((q, i) => ({ ...q, id: i + 1 })),
      minimo: Number(b.minimo),
    });
    result = { id: c.id };
  } else if ((m = path.match(/^\/etapas\/lecciones\/(\d+)\/completar$/))) {
    if (!pid) fail("Cambia a la vista Partner para registrar avance.");
    const l = courseList()
      .flatMap((c) => c.lecciones)
      .find((l) => l.id === Number(m[1]));
    if (!l) fail("Lección no disponible.");
    s.progreso[pid] = [...new Set([...(s.progreso[pid] || []), l.id])];
    result = {};
  } else if ((m = path.match(/^\/etapas\/cursos\/(\d+)\/evaluar$/))) {
    const c = course(Number(m[1]));
    if (!pid) fail("Cambia a la vista Partner para rendir una evaluación.");
    if (c.lecciones.some((l) => !(s.progreso[pid] || []).includes(l.id)))
      fail("Completa todas las lecciones primero.");
    if (
      !Array.isArray(b.respuestas) ||
      b.respuestas.some((r) => !Number.isInteger(r)) ||
      b.respuestas.length !== c.preguntas.length
    )
      fail("Responde todas las preguntas.");
    const nota = Math.round(
        (c.preguntas.filter((q, i) => q.correcta === b.respuestas[i]).length /
          c.preguntas.length) *
          100,
      ),
      aprobado = nota >= c.minimo;
    s.intentos.push({
      partner_id: pid,
      curso_id: c.id,
      nota,
      aprobado,
      creado_en: today(),
    });
    if (
      aprobado &&
      !s.certificados.some((x) => x.curso_id === c.id && x.partner_id === pid)
    )
      s.certificados.push({
        id: next(s.certificados),
        codigo: `VISTA-PREVIA-${pid}-${c.id}`,
        partner_id: pid,
        curso_id: c.id,
        nombre: u.partner.nombre,
        titulo: c.titulo,
        nota,
        emitido_en: today(),
      });
    result = { nota, aprobado, minimo: c.minimo };
  } else if (path === "/etapas/certificados")
    return {
      dato: s.certificados.filter(
        (c) => u.rol === "direccion" || c.partner_id === pid,
      ),
    };
  else if (path === "/crm" && method === "GET") return { datos: ops() };
  else if (path === "/crm" && method === "POST") {
    if (!pid || u.rol !== "partner")
      fail("Solo un Partner puede registrar oportunidades.");
    if (!b.empresa?.trim()) fail("Escribe el nombre de la empresa.");
    const id = next(s.oportunidades),
      o = {
        ...b,
        id,
        codigo: `OP-${String(id).padStart(4, "0")}`,
        partner_id: pid,
        etapa: "contacto",
        monto: b.monto === "" ? null : Number(b.monto),
        proximo_paso: b.proximoPaso,
        creado_en: today(),
        actualizado_en: today(),
      };
    s.oportunidades.push(o);
    save(s);
    return { dato: enrich(s, o) };
  } else if ((m = path.match(/^\/crm\/(\d+)$/))) {
    const o = ops().find((o) => o.id === Number(m[1]));
    if (!o) fail("Oportunidad no encontrada.", 404);
    const index = s.oportunidades.findIndex((x) => x.id === o.id);
    s.oportunidades[index] = {
      ...s.oportunidades[index],
      ...b,
      monto:
        b.monto === ""
          ? null
          : b.monto === undefined
            ? o.monto
            : Number(b.monto),
      proximo_paso: b.proximoPaso ?? o.proximo_paso,
    };
    save(s);
    return { dato: enrich(s, s.oportunidades[index]) };
  } else if (path === "/etapas/empresas" && method === "GET")
    return { dato: s.empresas.filter((e) => visible(u, enrich(s, e))) };
  else if (path === "/etapas/empresas" && method === "POST") {
    if (!pid) fail("Cambia a la vista Partner.");
    const id = next(s.empresas);
    s.empresas.push({
      ...b,
      id,
      partner_id: pid,
      partner_codigo: u.partner.codigo,
      contactos: [],
    });
    result = { id };
  } else if ((m = path.match(/^\/etapas\/empresas\/(\d+)\/contactos$/))) {
    const e = s.empresas.find(
      (e) => e.id === Number(m[1]) && visible(u, enrich(s, e)),
    );
    if (!e) fail("Empresa no encontrada.");
    e.contactos.push({ ...b, id: next(e.contactos) });
    result = {};
  } else if (
    (m = path.match(/^\/etapas\/oportunidades\/(\d+)\/seguimientos$/))
  ) {
    const o = ops().find((o) => o.id === Number(m[1]));
    if (!o) fail("Oportunidad no encontrada.");
    if (method === "GET")
      return {
        dato: s.seguimientos.filter((t) => t.oportunidad_id === o.id).reverse(),
      };
    const id = next(s.seguimientos);
    s.seguimientos.push({
      ...b,
      id,
      oportunidad_id: o.id,
      autor: u.correo,
      estado: b.tipo === "nota" ? "completado" : "pendiente",
      creado_en: today(),
    });
    result = { id };
  } else if ((m = path.match(/^\/etapas\/seguimientos\/(\d+)\/completar$/))) {
    const t = s.seguimientos.find(
      (t) =>
        t.id === Number(m[1]) && ops().some((o) => o.id === t.oportunidad_id),
    );
    if (!t) fail("Actividad no encontrada.");
    t.estado = "completado";
    result = {};
  } else if (path === "/etapas/gestion") {
    if (u.rol === "partner")
      fail("Acceso reservado a Dirección y líderes regionales.", 403);
    const oportunidades = ops(),
      ids = oportunidades.map((o) => o.id);
    return {
      dato: {
        oportunidades,
        partners: s.partners.filter(
          (p) =>
            u.rol === "direccion" ||
            p.territorio_id === u.partner.territorio_id,
        ),
        comisiones: s.comisiones
          .filter((c) => ids.includes(c.oportunidad_id))
          .map((c) => {
            const o = oportunidades.find((o) => o.id === c.oportunidad_id);
            return {
              ...c,
              empresa: o.empresa,
              oportunidad_codigo: o.codigo,
              partner_codigo: o.partner_codigo,
            };
          }),
        pendientes: s.seguimientos
          .filter(
            (t) => t.estado === "pendiente" && ids.includes(t.oportunidad_id),
          )
          .map((t) => {
            const o = oportunidades.find((o) => o.id === t.oportunidad_id);
            return {
              ...t,
              empresa: o.empresa,
              partner_codigo: o.partner_codigo,
            };
          }),
      },
    };
  } else if (path === "/etapas/comisiones" && method === "POST") {
    requireAdmin();
    const o = ops().find((o) => o.id === Number(b.oportunidadId));
    if (
      !o ||
      !["cierre", "posventa"].includes(o.etapa) ||
      s.comisiones.some((c) => c.oportunidad_id === o.id)
    )
      fail("Selecciona una oportunidad cerrada sin comisión.");
    s.comisiones.push({
      ...b,
      id: next(s.comisiones),
      oportunidad_id: o.id,
      moneda: o.moneda,
      estado: "pendiente",
      creado_en: today(),
    });
    result = {};
  } else if ((m = path.match(/^\/etapas\/comisiones\/(\d+)$/))) {
    requireAdmin();
    const c = s.comisiones.find((c) => c.id === Number(m[1]));
    if (!c) fail("Comisión no encontrada.");
    if (
      !{
        pendiente: ["aprobada", "rechazada"],
        aprobada: ["pagada"],
        pagada: [],
        rechazada: [],
      }[c.estado].includes(b.estado)
    )
      fail("Transición no permitida.");
    if (!b.referencia?.trim()) fail("Registra el sustento de la decisión.");
    c.estado = b.estado;
    c.referencia = b.referencia;
    result = {};
  } else if (path === "/direccion/territorios")
    return {
      datos: s.territorios.filter(
        (t) => u.rol === "direccion" || t.id === u.partner.territorio_id,
      ),
    };
  else if (path === "/direccion/postulaciones")
    return {
      datos: s.postulaciones.filter(
        (p) =>
          u.rol === "direccion" || p.territorio_id === u.partner.territorio_id,
      ),
    };
  else if (path === "/direccion/resumen") {
    const ps = s.postulaciones.filter(
        (p) =>
          u.rol === "direccion" || p.territorio_id === u.partner.territorio_id,
      ),
      partners = s.partners.filter(
        (p) =>
          u.rol === "direccion" || p.territorio_id === u.partner.territorio_id,
      );
    return {
      dato: {
        partners: {
          total: partners.length,
          activos: partners.filter((p) => p.estado === "activo").length,
        },
        postulaciones: {
          preseleccionadas: ps.filter((p) => p.estado === "preseleccionado")
            .length,
          aprobadas: ps.filter((p) => p.estado === "aprobado").length,
        },
      },
    };
  } else if ((m = path.match(/^\/direccion\/territorios\/(\d+)$/))) {
    requireAdmin();
    const t = s.territorios.find((t) => t.id === Number(m[1]));
    if (t) t.estado = b.estado;
    result = {};
  } else if (
    (m = path.match(/^\/direccion\/postulaciones\/(\d+)(\/activar)?$/))
  ) {
    const p = s.postulaciones.find((p) => p.id === Number(m[1]));
    if (!p) fail("Postulación no encontrada.");
    if (m[2]) {
      if (p.estado === "aprobado") fail("Esta postulación ya fue activada.");
      const id = next(s.partners),
        t = s.territorios.find((t) => t.id === p.territorio_id);
      const partner = {
        id,
        codigo: `P-${String(id).padStart(3, "0")}`,
        nombre: p.nombre,
        territorio_id: p.territorio_id,
        territorio: t?.nombre || "",
        nivel: "L2",
        estado: "activo",
        es_lider_regional: false,
      };
      s.partners.push(partner);
      p.estado = "aprobado";
      result = partner;
    } else {
      p.estado = b.estado;
      result = p;
    }
  } else if (path === "/postulaciones" && method === "POST") {
    const id = next(s.postulaciones),
      t = s.territorios.find((t) => t.id === Number(b.territorioId));
    s.postulaciones.push({
      ...b,
      id,
      territorio_id: t?.id,
      territorio: t?.nombre,
      codigo: `POST-${String(id).padStart(4, "0")}`,
      estado: "recibida",
      creado_en: today(),
    });
    result = { codigo: `POST-${String(id).padStart(4, "0")}` };
  } else
    fail(
      "Esta acción todavía no está disponible en la vista previa del frontend.",
      501,
    );
  save(s);
  return { dato: result };
}
