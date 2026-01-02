// src/components/AppRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Detectar si la app está instalada (PWA)
    const isStandalone = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
      );
    };

    // Si está en modo standalone (PWA instalada) y no está en login
    if (isStandalone() && location.pathname === '/') {
      console.log('📱 PWA detectada - Redirigiendo al login');
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  return <>{children}</>;
};

export default AppRouter;