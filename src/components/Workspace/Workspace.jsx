import { useSearchParams } from "react-router-dom";
import "./Workspace.css";
export function Input({ label, children, ...props }) {
  return (
    <label className="work-field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}
export function Notice({ children, error = false }) {
  return children ? (
    <p
      className={`work-notice${error ? " is-error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  ) : null;
}
// La pestaña activa vive en la URL (?vista=...): sirve el botón atrás, recargar y compartir el enlace.
export function useTabParam(defecto, validos) {
  const [params, setParams] = useSearchParams();
  const pedido = params.get("vista");
  const tab = validos.includes(pedido) ? pedido : defecto;
  const setTab = (t) =>
    setParams(
      (anterior) => {
        const n = new URLSearchParams(anterior);
        if (t === defecto) n.delete("vista");
        else n.set("vista", t);
        return n;
      },
      { replace: true },
    );
  return [tab, setTab];
}
export function Tabs({ items, value, onChange }) {
  return (
    <nav className="work-tabs" aria-label="Vistas del módulo">
      {items.map(([id, label]) => (
        <button
          type="button"
          key={id}
          className={value === id ? "is-active" : ""}
          aria-current={value === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
export const money = (n, currency = "USD") =>
  n == null
    ? "Por cotizar"
    : new Intl.NumberFormat("es-PE", { style: "currency", currency }).format(
        Number(n),
      );
export const fecha = (v) =>
  v
    ? new Date(v).toLocaleDateString("es-PE", { timeZone: "UTC" })
    : "Sin fecha";
export function downloadCsv(name, rows) {
  const escape = (v) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const blob = new Blob(
    ["\uFEFF" + rows.map((r) => r.map(escape).join(";")).join("\r\n")],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
