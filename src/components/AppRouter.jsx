// src/components/AppRouter.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AppRouter = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar si venimos directamente de la app instalada
    const isActuallyRunningAsApp = () => {
      // Si hay un parámetro en la URL que indica que viene de la app
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('source') === 'pwa') {
        return true;
      }

      // Verificación más estricta: solo si realmente está en modo standalone
      const isStandalone = 
        window.navigator.standalone === true || 
        window.matchMedia('(display-mode: standalone)').matches;

      // Y además, verificar que NO hay un referrer normal de navegador
      const hasNormalReferrer = document.referrer && 
        !document.referrer.includes('android-app://') &&
        document.referrer.length > 0;

      // Si está en standalone PERO tiene referrer normal, es navegador
      if (isStandalone && hasNormalReferrer) {
        console.log('🌐 Detectado: Navegador web (tiene referrer normal)');
        return false;
      }

      // Si está en standalone y NO tiene referrer, es la app
      if (isStandalone && !hasNormalReferrer) {
        console.log('📱 Detectado: App instalada (sin referrer)');
        return true;
      }

      return false;
    };

    // Debug: ver qué está detectando
    console.log('--- DEBUG AppRouter ---');
    console.log('Ruta actual:', location.pathname);
    console.log('Navigator standalone:', window.navigator.standalone);
    console.log('Display mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
    console.log('Referrer:', document.referrer);
    console.log('¿Es app?:', isActuallyRunningAsApp());
    console.log('----------------------');

    // Solo redirigir si es app Y está en raíz
    if (isActuallyRunningAsApp() && location.pathname === '/') {
      console.log('✅ Redirigiendo al login desde app');
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);

  return <>{children}</>;
};

export default AppRouter;