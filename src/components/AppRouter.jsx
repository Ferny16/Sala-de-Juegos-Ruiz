// src/components/AppRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Detectar si la app fue abierta desde el icono instalado
    const isOpenedFromInstalledApp = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('source') === 'pwa';
    };

    const fromPWA = isOpenedFromInstalledApp();
    
    // Logs para debugging (solo visibles en consola de desarrollador)
    console.log('--- AppRouter ---');
    console.log('Ruta:', location.pathname);
    console.log('Parámetro source:', new URLSearchParams(window.location.search).get('source'));
    console.log('Desde app instalada:', fromPWA);
    console.log('-----------------');

    // Solo redirigir al login si viene de la app instalada Y está en la raíz
    if (fromPWA && location.pathname === '/') {
      console.log('📱 Redirigiendo al login desde app instalada');
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  return <>{children}</>;
};

export default AppRouter;