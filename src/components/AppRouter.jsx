// src/components/AppRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Método DEFINITIVO: Solo confiar en el parámetro ?source=pwa
    const isOpenedFromInstalledApp = () => {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('source') === 'pwa';
    };

    const fromPWA = isOpenedFromInstalledApp();
    
    console.log('--- DEBUG AppRouter ---');
    console.log('Ruta actual:', location.pathname);
    console.log('URL completa:', window.location.href);
    console.log('Parámetro source:', new URLSearchParams(window.location.search).get('source'));
    console.log('¿Abierto desde app instalada?:', fromPWA);
    console.log('----------------------');

    // REGLA SIMPLE: Solo redirigir si tiene ?source=pwa Y está en /
    if (fromPWA && location.pathname === '/') {
      console.log('✅ App instalada detectada - Redirigiendo al login');
      navigate('/login', { replace: true });
    } else if (!fromPWA) {
      console.log('🌐 Navegador web - Mantener en página actual');
    }
  }, [navigate, location]);

  return <>{children}</>;
};

export default AppRouter;