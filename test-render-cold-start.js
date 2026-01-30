// test-render-cold-start.js
// test-render-cold-start.js
const RENDER_URL = 'https://sala-de-juegos-backend.onrender.com';

async function testColdStart() {
  console.log('🧪 Probando cold start de Render...');
  console.log(`📍 URL: ${RENDER_URL}`);
  console.log('⏳ Esperando respuesta...\n');
  
  const startTime = Date.now();
  
  try {
    // Usa la ruta de login con credenciales de prueba
    const response = await fetch(`${RENDER_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'jefernee.ruiz@gmail.com',  // ⬅️ Cambia por un email real de tu DB
        password: 'Jef#2025!Rx'       // ⬅️ Cambia por una contraseña real
      })
    });
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`⏱️  Tiempo total: ${duration.toFixed(2)} segundos`);
    console.log(`📊 Status: ${response.status}`);
    
    if (duration > 10) {
      console.log('❄️  Probablemente fue un COLD START');
    } else if (duration > 5) {
      console.log('🔶 Posible cold start o conexión lenta');
    } else {
      console.log('🔥 Servicio ya estaba activo (WARM)');
    }
    
    const data = await response.json();
    console.log('📦 Response:', data);
    
  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`❌ Error después de ${duration.toFixed(2)}s:`, error.message);
  }
}

testColdStart();