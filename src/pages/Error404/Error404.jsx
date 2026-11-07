import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Error404.css';

export default function Error404() {
  const navigate = useNavigate();

  const handleVolver = () => {
    
    navigate('/panel');
  };

  return (
    <main className="error-simple-container">
      <div className="error-simple-card">
        <span className="error-simple-badge">Error 404</span>
        <h1 className="error-simple-title">Página no encontrada</h1>
        <p className="error-simple-description">
          La dirección web que ingresó no existe o ha sido movida a otra ubicación dentro del portal.
        </p>

        <div className="error-simple-actions">
          <button 
            type="button" 
            onClick={handleVolver} 
            className="error-btn-primary"
          >
            Volver al panel principal
          </button>
        </div>
      </div>
    </main>
  );
}
