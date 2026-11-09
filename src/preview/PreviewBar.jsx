import {
  enterPreview,
  leavePreview,
  previewRole,
  resetPreview,
} from "./store.js";
import "./Preview.css";
export default function PreviewBar() {
  return (
    <aside className="preview-bar" aria-label="Controles de vista previa">
      <div>
        <strong>Vista previa del frontend</strong>
        <p>Datos de ejemplo · Los cambios solo se guardan en esta pestaña.</p>
      </div>
      <div className="preview-bar__actions">
        <a href="/revisar-acceso">Ver acceso</a>
        <a href="/postulacion">Ver postulación</a>
        <label>
          Revisar como
          <select
            value={previewRole()}
            onChange={(e) => {
              enterPreview(e.target.value);
              window.location.assign(
                e.target.value === "partner" ? "/" : "/direccion",
              );
            }}
          >
            <option value="direccion">Dirección</option>
            <option value="partner">Partner</option>
            <option value="lider_regional">Líder Regional</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            resetPreview();
            window.location.reload();
          }}
        >
          Restablecer ejemplos
        </button>
        <button
          type="button"
          onClick={() => {
            leavePreview();
            window.location.assign("/acceso");
          }}
        >
          Salir de vista previa
        </button>
      </div>
    </aside>
  );
}
