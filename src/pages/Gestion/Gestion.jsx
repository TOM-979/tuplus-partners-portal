import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader/PageHeader.jsx";
import StatCard from "../../components/StatCard/StatCard.jsx";
import Badge from "../../components/Badge/Badge.jsx";
import {
  Cargando,
  ErrorEstado,
  Vacio,
} from "../../components/Estado/Estado.jsx";
import {
  Input,
  Notice,
  Tabs,
  money,
  fecha,
  downloadCsv,
} from "../../components/Workspace/Workspace.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../lib/api.js";
import { STAGES } from "../Crm/Crm.jsx";

const status = {
  pendiente: ["Por aprobar", "warn"],
  aprobada: ["Aprobada", "info"],
  rechazada: ["Rechazada", "neutral"],
  pagada: ["Pago registrado", "ok"],
};
export default function Gestion() {
  const { usuario } = useAuth(),
    admin = usuario.rol === "direccion";
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState("reportes");
  const [territorio, setTerritorio] = useState(""),
    [moneda, setMoneda] = useState("USD"),
    [desde, setDesde] = useState(""),
    [hasta, setHasta] = useState("");
  const [proposal, setProposal] = useState({
      oportunidadId: "",
      monto: "",
      sustento: "",
    }),
    [decision, setDecision] = useState(null);
  async function load() {
    try {
      const r = await api.get("/etapas/gestion");
      setData(r.dato);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function action(fn, message) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await fn();
      await load();
      setNotice(message);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return error ? (
      <ErrorEstado mensaje={error} onReintentar={load} />
    ) : (
      <Cargando texto="Preparando la gestión ejecutiva…" />
    );
  const ops = data.oportunidades.filter(
    (o) =>
      (!territorio || o.territorio === territorio) &&
      o.moneda === moneda &&
      (!desde || o.creado_en.slice(0, 10) >= desde) &&
      (!hasta || o.creado_en.slice(0, 10) <= hasta),
  );
  const total = ops.reduce((sum, o) => sum + Number(o.monto || 0), 0),
    cerradas = ops.filter((o) => ["cierre", "posventa"].includes(o.etapa));
  const eligible = data.oportunidades.filter(
    (o) =>
      ["cierre", "posventa"].includes(o.etapa) &&
      !data.comisiones.some((c) => c.oportunidad_id === o.id),
  );
  const exportar = () =>
    downloadCsv("reporte-comercial-tuplus.csv", [
      [
        "Código",
        "Empresa",
        "Partner",
        "Territorio",
        "Etapa",
        "Importe estimado",
        "Moneda",
        "Registro",
      ],
      ...ops.map((o) => [
        o.codigo,
        o.empresa,
        o.partner_codigo,
        o.territorio,
        o.etapa,
        o.monto,
        o.moneda,
        fecha(o.creado_en),
      ]),
    ]);
  return (
    <div className="work-stack">
      <PageHeader
        title="Gestión ejecutiva"
        description={
          admin
            ? "Visibilidad comercial, supervisión de la red y decisiones con respaldo."
            : "Indicadores y seguimiento de los Partners de tu territorio."
        }
      />
      <section className="work-hero">
        <div>
          <span className="work-eyebrow">
            Etapa 04 · Dirección y seguimiento
          </span>
          <h2>Una visión clara para decidir mejor</h2>
          <p>
            Consulta el avance comercial, revisa compromisos y documenta cada
            aprobación.
          </p>
        </div>
        <span className="work-badge-number">04</span>
      </section>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          ["reportes", "Reportes comerciales"],
          ["red", "Supervisión regional"],
          ["comisiones", "Comisiones"],
          ["posventa", "Seguimiento y posventa"],
        ]}
      />
      <Notice error>{error}</Notice>
      <Notice>{notice}</Notice>
      {tab === "reportes" && (
        <>
          <section className="card work-stack">
            <div className="work-section-head">
              <div>
                <h2>Rendimiento de la cartera</h2>
                <p className="work-muted">
                  Importes estimados de oportunidades. Cada moneda se consulta
                  por separado.
                </p>
              </div>
              <button
                className="btn btn-ghost"
                disabled={desde && hasta && desde > hasta}
                onClick={exportar}
              >
                Exportar CSV
              </button>
            </div>
            <div className="work-fields">
              <Input label="Territorio">
                <select
                  value={territorio}
                  onChange={(e) => setTerritorio(e.target.value)}
                >
                  <option value="">Todos los territorios de mi alcance</option>
                  {[...new Set(data.partners.map((p) => p.territorio))].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </select>
              </Input>
              <Input label="Moneda">
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <option value="USD">USD · Dólares</option>
                  <option value="PEN">PEN · Soles</option>
                </select>
              </Input>
              <Input
                label="Registro desde"
                type="date"
                value={desde}
                max={hasta || undefined}
                onChange={(e) => setDesde(e.target.value)}
              />
              <Input
                label="Registro hasta"
                type="date"
                value={hasta}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            {desde && hasta && desde > hasta && (
              <Notice error>
                La fecha inicial debe ser anterior a la final.
              </Notice>
            )}
          </section>
          <div className="work-metrics">
            <StatCard label="Oportunidades" value={ops.length} />
            <StatCard label="Valor estimado" value={money(total, moneda)} />
            <StatCard label="En cierre o posventa" value={cerradas.length} />
            <StatCard
              label="Participación de cierre"
              value={`${ops.length ? Math.round((cerradas.length * 100) / ops.length) : 0}%`}
              note="Cierre y posventa / oportunidades"
            />
          </div>
          <div className="work-split">
            <section className="card work-stack">
              <h2>Distribución por etapa</h2>
              {STAGES.map(([id, label]) => {
                const list = ops.filter((o) => o.etapa === id);
                return (
                  <div key={id}>
                    <div className="work-section-head">
                      <span>{label}</span>
                      <strong>
                        {list.length} ·{" "}
                        {money(
                          list.reduce((s, o) => s + Number(o.monto || 0), 0),
                          moneda,
                        )}
                      </strong>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "var(--bg)",
                        borderRadius: 8,
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${ops.length ? (list.length / ops.length) * 100 : 0}%`,
                          background: "var(--gold-500)",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </section>
            <section className="card work-stack">
              <h2>Por territorio</h2>
              {[...new Set(ops.map((o) => o.territorio))].map((t) => {
                const list = ops.filter((o) => o.territorio === t);
                return (
                  <div className="work-row" key={t}>
                    <div>
                      <strong>{t}</strong>
                      <p className="work-muted">{list.length} oportunidades</p>
                    </div>
                    <strong>
                      {money(
                        list.reduce((s, o) => s + Number(o.monto || 0), 0),
                        moneda,
                      )}
                    </strong>
                  </div>
                );
              })}
              {!ops.length && (
                <p className="work-muted">
                  No hay registros con estos filtros.
                </p>
              )}
            </section>
          </div>
        </>
      )}
      {tab === "red" && (
        <section className="work-stack">
          <div className="work-section-head">
            <div>
              <h2>Partners por territorio</h2>
              <p className="work-muted">
                Estado, nivel y cartera comercial de cada socio.
              </p>
            </div>
            <Link className="btn btn-ghost" to="/direccion">
              Gestionar postulaciones
            </Link>
          </div>
          {!data.partners.length ? (
            <Vacio
              titulo="La red aún no tiene Partners"
              texto="Activa una postulación desde el panel de Dirección."
              icono="user"
            />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Territorio</th>
                    <th>Nivel</th>
                    <th>Estado</th>
                    <th>Cartera</th>
                  </tr>
                </thead>
                <tbody>
                  {data.partners.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.nombre}</strong>
                        <p className="work-muted">
                          {p.codigo}
                          {p.es_lider_regional ? " · Líder Regional" : ""}
                        </p>
                      </td>
                      <td>{p.territorio}</td>
                      <td>
                        <Badge tone="gold">{p.nivel}</Badge>
                      </td>
                      <td>
                        <Badge tone={p.estado === "activo" ? "ok" : "neutral"}>
                          {p.estado}
                        </Badge>
                      </td>
                      <td>
                        {
                          data.oportunidades.filter(
                            (o) => o.partner_id === p.id,
                          ).length
                        }{" "}
                        oportunidades
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
      {tab === "comisiones" && (
        <>
          <section className="card work-stack">
            <h2>Comisiones con aprobación manual</h2>
            <p className="work-muted">
              Cada propuesta registra un importe y un sustento. Dirección
              documenta la aprobación y, después, la referencia de pago. No se
              calculan porcentajes ni se ejecutan transferencias.
            </p>
            {admin && (
              <form
                className="work-stack"
                onSubmit={(e) => {
                  e.preventDefault();
                  action(async () => {
                    await api.post("/etapas/comisiones", proposal);
                    setProposal({ oportunidadId: "", monto: "", sustento: "" });
                  }, "Propuesta registrada. Queda pendiente de aprobación.");
                }}
              >
                <div className="work-fields">
                  <Input label="Oportunidad cerrada">
                    <select
                      required
                      value={proposal.oportunidadId}
                      onChange={(e) =>
                        setProposal({
                          ...proposal,
                          oportunidadId: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecciona una oportunidad</option>
                      {eligible.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.codigo} · {o.empresa} · {o.moneda}
                        </option>
                      ))}
                    </select>
                  </Input>
                  <Input
                    label={`Importe propuesto (${eligible.find((o) => o.id === Number(proposal.oportunidadId))?.moneda || "moneda de la oportunidad"})`}
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    max="9999999999.99"
                    value={proposal.monto}
                    onChange={(e) =>
                      setProposal({ ...proposal, monto: e.target.value })
                    }
                  />
                </div>
                <Input label="Sustento de la propuesta">
                  <textarea
                    required
                    maxLength={1000}
                    value={proposal.sustento}
                    onChange={(e) =>
                      setProposal({ ...proposal, sustento: e.target.value })
                    }
                  />
                </Input>
                <button
                  className="btn btn-primary"
                  disabled={busy || eligible.length === 0}
                >
                  Registrar propuesta
                </button>
                {!eligible.length && (
                  <p className="work-muted">
                    Se requiere una oportunidad en cierre o posventa que todavía
                    no tenga comisión.
                  </p>
                )}
              </form>
            )}
          </section>
          {decision && (
            <form
              className="card work-stack"
              onSubmit={(e) => {
                e.preventDefault();
                action(async () => {
                  await api.patch(
                    `/etapas/comisiones/${decision.id}`,
                    decision,
                  );
                  setDecision(null);
                }, "Decisión registrada en el historial.");
              }}
            >
              <h2>
                {decision.estado === "pagada"
                  ? "Registrar pago"
                  : decision.estado === "aprobada"
                    ? "Aprobar comisión"
                    : "Rechazar comisión"}{" "}
                · #{decision.id}
              </h2>
              <p>
                {money(decision.monto, decision.moneda)} · {decision.empresa}
              </p>
              <Input
                label={
                  decision.estado === "pagada"
                    ? "Referencia o comprobante del pago"
                    : "Referencia de autorización o motivo de la decisión"
                }
              >
                <textarea
                  required
                  maxLength={255}
                  value={decision.referencia}
                  onChange={(e) =>
                    setDecision({ ...decision, referencia: e.target.value })
                  }
                />
              </Input>
              <div className="work-actions">
                <button className="btn btn-gold" disabled={busy}>
                  Confirmar registro
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => setDecision(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
          {data.comisiones.length ? (
            <div className="work-grid">
              {data.comisiones.map((c) => (
                <article key={c.id} className="card work-stack">
                  <div className="work-section-head">
                    <span className="work-muted">
                      {c.oportunidad_codigo} · {c.partner_codigo}
                    </span>
                    <Badge tone={status[c.estado][1]}>
                      {status[c.estado][0]}
                    </Badge>
                  </div>
                  <h2>{c.empresa}</h2>
                  <strong style={{ fontSize: 24 }}>
                    {money(c.monto, c.moneda)}
                  </strong>
                  <p className="work-prose">{c.sustento}</p>
                  <p className="work-muted">
                    {fecha(c.creado_en)}
                    {c.referencia ? ` · ${c.referencia}` : ""}
                  </p>
                  {admin && (
                    <div className="work-actions">
                      {(c.estado === "pendiente"
                        ? [
                            ["aprobada", "Aprobar"],
                            ["rechazada", "Rechazar"],
                          ]
                        : c.estado === "aprobada"
                          ? [["pagada", "Registrar pago"]]
                          : []
                      ).map(([estado, label]) => (
                        <button
                          key={estado}
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() =>
                            setDecision({ ...c, estado, referencia: "" })
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <Vacio
              titulo="Aún no hay comisiones registradas"
              texto="Las propuestas y sus decisiones aparecerán aquí."
              icono="chart"
            />
          )}
        </>
      )}
      {tab === "posventa" && (
        <>
          <div className="work-section-head">
            <div>
              <h2>Compromisos pendientes</h2>
              <p className="work-muted">
                Llamadas, reuniones y actividades de posventa de tu alcance.
              </p>
            </div>
            <Link className="btn btn-primary" to="/crm">
              Abrir CRM
            </Link>
          </div>
          {!data.pendientes.length ? (
            <Vacio
              titulo="Sin compromisos pendientes"
              texto="Registra actividades desde el seguimiento de una oportunidad en el CRM."
              icono="check"
            />
          ) : (
            <div className="work-grid">
              {data.pendientes.map((s) => (
                <article className="card work-stack" key={s.id}>
                  <div className="work-section-head">
                    <Badge tone={s.tipo === "posventa" ? "gold" : "info"}>
                      {s.tipo === "reunion" ? "Reunión" : s.tipo}
                    </Badge>
                    <span className="work-muted">{s.partner_codigo}</span>
                  </div>
                  <h2>{s.empresa}</h2>
                  <p className="work-prose">{s.detalle}</p>
                  <p className="work-muted">Fecha: {fecha(s.fecha)}</p>
                  <button
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() =>
                      action(
                        () =>
                          api.patch(
                            `/etapas/seguimientos/${s.id}/completar`,
                            {},
                          ),
                        "Seguimiento completado.",
                      )
                    }
                  >
                    Marcar completado
                  </button>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
