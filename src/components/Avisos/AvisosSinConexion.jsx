import './Avisos.css';
import React, { useState, useEffect } from 'react';

export default function AvisosSinConexion() {
  const [estaEnLinea, setEstaEnLinea] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setEstaEnLinea(true);
    const handleOffline = () => setEstaEnLinea(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (estaEnLinea) return null;

  return (
    <aside className="banner-sin-conexion" role="status" aria-live="polite">
      <div className="banner-contenido">
        <span className="banner-icono">⚠️</span>
        <p className="banner-mensaje">
          No tienes conexión a internet en este momento.
        </p>
      </div>
    </aside>
  );
}