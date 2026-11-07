import { useNavigate } from 'react-router-dom';
import './Avisos.css';

export default function SesionVencida({ abierto = true, onCerrar }) {
  const navigate = useNavigate();

  if (!abierto) return null;

  const handleIniciarSesion = () => {

    const formularios = document.querySelectorAll('form');
    formularios.forEach((form, index) => {
      const formData = new FormData(form);
      const datos = Object.fromEntries(formData.entries());
      if (Object.keys(datos).length > 0) {
        localStorage.setItem(`borrador_formulario_${index}`, JSON.stringify(datos));
      }
    });

    if (onCerrar) onCerrar();
    navigate('/acceso');
  };

  return (
    <div className="modal-sesion-overlay" role="dialog" aria-modal="true">
      <div className="modal-sesion-tarjeta">
        <div className="modal-sesion-icono">⏳</div>
        <h2 className="modal-sesion-titulo">Sesión finalizada</h2>
        <p className="modal-sesion-texto">
          Tu sesión terminó por inactividad. Inicia sesión otra vez para continuar.
        </p>
        <button
          type="button"
          onClick={handleIniciarSesion}
          className="modal-sesion-boton"
        >
          Iniciar sesión otra vez para continuar
        </button>
      </div>
    </div>
  );
}