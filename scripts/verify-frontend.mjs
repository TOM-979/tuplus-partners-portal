import { build } from "esbuild";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

// Verifica los flujos interactivos sin navegador, servidor ni base de datos.
const root = fileURLToPath(new URL("../", import.meta.url));
const bundle = await build({
  stdin: {
    contents:
      "export * from './src/preview/store.js'; export { api, token } from './src/lib/api.js'",
    resolveDir: root,
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  define: { "import.meta.env": '{ "DEV": true }' },
});
const memory = () => {
  const m = new Map();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};
globalThis.sessionStorage = memory();
globalThis.localStorage = memory();
globalThis.fetch = () => {
  throw Error("La vista previa intentó conectarse a la red.");
};
const {
  api,
  token,
  enterPreview,
  leavePreview,
  resetPreview,
  previewUser,
  isPreview,
} = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);
let checks = 0;
const check = (value, message) => {
  assert(value, message);
  checks++;
};
token.set("sesion-real-no-modificar");
enterPreview();
check(isPreview(), "La revisión se activa explícitamente.");
check(previewUser().rol === "direccion", "La primera vista es Dirección.");
const [niveles, gestion, cursos] = await Promise.all([
  api.get("/niveles"),
  api.get("/etapas/gestion"),
  api.get("/etapas/cursos"),
]);
check(niveles.datos.length === 7, "Los niveles L0–L6 están disponibles.");
check(
  gestion.dato.oportunidades.length === 6,
  "El tablero contiene todas las etapas.",
);
check(
  cursos.dato.some((c) => !c.publicado),
  "Dirección puede revisar borradores.",
);
const nuevo = {
  titulo: "Curso de revisión",
  descripcion: "Contenido de ejemplo",
  nivelId: "L2",
  minimo: 70,
  lecciones: [
    {
      titulo: "Lección",
      tipo: "lectura",
      contenido: "Lectura de revisión",
      duracion_min: 5,
    },
  ],
  preguntas: [{ texto: "Pregunta", opciones: ["Sí", "No"], correcta: 0 }],
};
const { dato: created } = await api.post("/etapas/cursos", nuevo);
await api.patch(`/etapas/cursos/${created.id}/contenido`, {
  ...nuevo,
  titulo: "Curso revisado",
});
check(
  (await api.get(`/etapas/cursos/${created.id}`)).dato.titulo ===
    "Curso revisado",
  "Se edita un borrador.",
);
await api.patch(`/etapas/cursos/${created.id}`, { publicado: true });
enterPreview("partner");
check(
  previewUser().partner.codigo === "P-001",
  "La vista Partner se carga sin iniciar una sesión real.",
);
check(
  !(await api.get("/etapas/cursos")).dato.some((c) => !c.publicado),
  "Los Partners ven cursos publicados.",
);
const { dato: detail } = await api.get(`/etapas/cursos/${created.id}`);
await assert.rejects(
  api.post(`/etapas/cursos/${created.id}/evaluar`, { respuestas: [0] }),
);
checks++;
await api.post(`/etapas/lecciones/${detail.lecciones[0].id}/completar`);
const { dato: result } = await api.post(
  `/etapas/cursos/${created.id}/evaluar`,
  { respuestas: [0] },
);
check(
  result.aprobado && result.nota === 100,
  "Una evaluación aprobada entrega resultado.",
);
check(
  (await api.get("/etapas/certificados")).dato.length === 1,
  "Se genera una constancia imprimible.",
);
const { dato: company } = await api.post("/etapas/empresas", {
  nombre: "Empresa de revisión",
  sector: "Servicios",
  ciudad: "Lima",
});
await api.post(`/etapas/empresas/${company.id}/contactos`, {
  nombre: "Contacto de prueba",
  correo: "contacto@example.com",
});
check(
  (await api.get("/etapas/empresas")).dato.find((c) => c.id === company.id)
    .contactos.length === 1,
  "Se registra un contacto de empresa.",
);
const { dato: op } = await api.post("/crm", {
  empresa: "Empresa de revisión",
  monto: "1200",
  moneda: "PEN",
  contacto: "Contacto de prueba",
  proximoPaso: "Coordinar reunión",
});
await api.patch(`/crm/${op.id}`, { etapa: "negociacion", monto: "1400" });
check(
  (await api.get("/crm")).datos.find((o) => o.id === op.id).monto === 1400,
  "Se edita una oportunidad y su etapa.",
);
await api.post(`/etapas/oportunidades/${op.id}/seguimientos`, {
  tipo: "posventa",
  detalle: "Revisar entrega",
  fecha: "2026-12-01",
});
const { dato: tasks } = await api.get(
  `/etapas/oportunidades/${op.id}/seguimientos`,
);
await api.patch(`/etapas/seguimientos/${tasks[0].id}/completar`, {});
check(
  (await api.get(`/etapas/oportunidades/${op.id}/seguimientos`)).dato[0]
    .estado === "completado",
  "Se completa una actividad.",
);
check(
  (await api.get("/crm")).datos.every((o) => o.partner_id === 1),
  "La vista Partner conserva su cartera.",
);
check(
  (await api.get("/perfil")).dato.partner.nivel === "L2",
  "El perfil mantiene su nivel.",
);
await api.patch(`/crm/${op.id}`, { etapa: "cierre" });
enterPreview("direccion");
await api.post("/etapas/comisiones", {
  oportunidadId: op.id,
  monto: 100,
  sustento: "Importe manual de prueba",
});
const comm = (await api.get("/etapas/gestion")).dato.comisiones.find(
  (c) => c.oportunidad_id === op.id,
);
await api.patch(`/etapas/comisiones/${comm.id}`, {
  estado: "aprobada",
  referencia: "Acta de ejemplo",
});
await api.patch(`/etapas/comisiones/${comm.id}`, {
  estado: "pagada",
  referencia: "Referencia de ejemplo",
});
check(
  (await api.get("/etapas/gestion")).dato.comisiones.find(
    (c) => c.id === comm.id,
  ).estado === "pagada",
  "El flujo manual llega al registro de pago.",
);
await api.post("/postulaciones", {
  nombre: "Postulante de ejemplo",
  correo: "postulante@example.com",
  territorioId: 1,
});
const candidate = (await api.get("/direccion/postulaciones")).datos.find(
  (p) => p.correo === "postulante@example.com",
);
const { dato: activated } = await api.post(
  `/direccion/postulaciones/${candidate.id}/activar`,
);
check(
  (await api.get("/etapas/gestion")).dato.partners.some(
    (p) => p.codigo === activated.codigo,
  ),
  "La activación simulada se refleja en supervisión.",
);
enterPreview("lider_regional");
check(
  (await api.get("/etapas/gestion")).dato.partners.every(
    (p) => p.territorio === "Lima Metropolitana",
  ),
  "La supervisión regional respeta el territorio de ejemplo.",
);
await assert.rejects(
  api.post("/etapas/comisiones", {
    oportunidadId: 6,
    monto: 100,
    sustento: "Prueba",
  }),
);
checks++;
resetPreview();
check(
  (await api.get("/etapas/gestion")).dato.oportunidades.length === 5,
  "Restablecer recupera los ejemplos iniciales del territorio.",
);
leavePreview();
check(!isPreview(), "Se puede salir de la revisión.");
check(
  token.get() === "sesion-real-no-modificar",
  "La vista previa conserva la sesión real del usuario.",
);
console.log(
  `OK: ${checks} comprobaciones del frontend sin usar la red ni la base de datos.`,
);
