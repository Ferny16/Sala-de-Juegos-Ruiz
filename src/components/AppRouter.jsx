// src/components/AppRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Detectar si la app está EJECUTÁNDOSE en modo standalone
    // (no solo instalada, sino ABIERTA desde el icono de la app)
    const isRunningAsApp = () => {
      // Para iOS
      if (window.navigator.standalone === true) {
        return true;
      }
      
      // Para Android y Desktop
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      
      // Para Android (detección adicional)
      if (document.referrer.includes('android-app://')) {
        return true;
      }
      
      return false;
    };

    // Solo redirigir si:
    // 1. Se está ejecutando COMO app (no en navegador)
    // 2. Y está en la ruta raíz '/'
    if (isRunningAsApp() && location.pathname === '/') {
      console.log('📱 App standalone detectada - Redirigiendo al login');
      navigate('/login', { replace: true });
    } else if (isRunningAsApp()) {
      console.log('📱 App standalone detectada en ruta:', location.pathname);
    } else {
      console.log('🌐 Ejecutando en navegador web');
    }
  }, [navigate, location]);

  return <>{children}</>;
};

export default AppRouter;