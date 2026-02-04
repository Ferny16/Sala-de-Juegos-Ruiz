import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // ✅ IMPORTAR Link
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertTriangle, DollarSign, ShoppingCart } from 'lucide-react';
import '../styles/ReportesDashboard.css';

const API_URL = process.env.REACT_APP_API_URL + '/api';


export default function ReportesDashboard() {
  const [resumen, setResumen] = useState(null);
  const [masVendidos, setMasVendidos] = useState([]);
  const [menosVendidos, setMenosVendidos] = useState([]);
  const [stockBajo, setStockBajo] = useState({ stockBajo: [], agotados: [] });
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [estadisticasPedidos, setEstadisticasPedidos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resumenRes, masVendidosRes, menosVendidosRes, stockBajoRes, ventasRes, pedidosRes] = await Promise.all([
        fetch(`${API_URL}/reports/resumen`),
        fetch(`${API_URL}/reports/mas-vendidos?limit=10`),
        fetch(`${API_URL}/reports/menos-vendidos?limit=10`),
        fetch(`${API_URL}/reports/stock-bajo`),
        fetch(`${API_URL}/reports/ventas-periodo?days=30`),
        fetch(`${API_URL}/reports/pedidos-stats`)
      ]);

      setResumen(await resumenRes.json());
      setMasVendidos((await masVendidosRes.json()).productos || []);
      setMenosVendidos((await menosVendidosRes.json()).productos || []);
      setStockBajo(await stockBajoRes.json());
      setVentasPorDia((await ventasRes.json()).datos || []);
      setEstadisticasPedidos(await pedidosRes.json());
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reportes-dashboard">
      {/* ✅ NAVBAR AGREGADO */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
        <div className="container-fluid">
          {/* Logo / Home */}
          <Link className="navbar-brand fw-bold" to="/">
            🎮 Sala de Juegos Ruiz
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2">
              <li className="nav-item">
                <Link className="nav-link active" to="/dashboard/pedidos">
                  📦 Pedidos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/reportes">
                  📈 Reportes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/dashboard/sales">
                  💰 Ventas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/add-product">
                  🆕 Agregar Producto
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/manage-products">
                  ⚙️ Gestionar Productos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ✅ CONTENIDO ORIGINAL */}
      <div className="reportes-container">
        {/* Header */}
        <div className="reportes-header">
          <h1 className="reportes-title">Reportes y Estadísticas</h1>
          <p className="reportes-subtitle">Análisis completo de tu negocio</p>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="resumen-grid">
          {/* Ventas Hoy */}
          <div className="tarjeta-resumen verde">
            <div className="tarjeta-header">
              <h3 className="tarjeta-label">Ventas Hoy</h3>
              <DollarSign className="tarjeta-icon verde" size={24} />
            </div>
            <p className="tarjeta-valor">{formatearMoneda(resumen?.ventasHoy?.total || 0)}</p>
            <p className="tarjeta-detalle verde">Ganancia: {formatearMoneda(resumen?.ventasHoy?.ganancias || 0)}</p>
            <div className="tarjeta-emoji verde">💰</div>
          </div>

          {/* Ventas del Mes */}
          <div className="tarjeta-resumen azul">
            <div className="tarjeta-header">
              <h3 className="tarjeta-label">Ventas del Mes</h3>
              <TrendingUp className="tarjeta-icon azul" size={24} />
            </div>
            <p className="tarjeta-valor">{formatearMoneda(resumen?.ventasMes?.total || 0)}</p>
            <p className="tarjeta-detalle verde">Ganancia: {formatearMoneda(resumen?.ventasMes?.ganancias || 0)}</p>
            <div className="tarjeta-emoji azul">📊</div>
          </div>

          {/* Pedidos Pendientes */}
          <div className="tarjeta-resumen amarillo">
            <div className="tarjeta-header">
              <h3 className="tarjeta-label">Pedidos Pendientes</h3>
              <ShoppingCart className="tarjeta-icon amarillo" size={24} />
            </div>
            <p className="tarjeta-valor">{resumen?.pedidosPendientes || 0}</p>
            <p className="tarjeta-detalle">{resumen?.inventarioVenta?.stockBajo || 0} con stock bajo</p>
            <div className="tarjeta-emoji amarillo">⏳</div>
          </div>

          {/* Productos Agotados */}
          <div className="tarjeta-resumen rojo">
            <div className="tarjeta-header">
              <h3 className="tarjeta-label">Productos Agotados</h3>
              <AlertTriangle className="tarjeta-icon rojo" size={24} />
            </div>
            <p className="tarjeta-valor">{resumen?.inventarioVenta?.agotados || 0}</p>
            <p className="tarjeta-detalle">Requieren reabastecimiento</p>
            <div className="tarjeta-emoji rojo">❌</div>
          </div>
        </div>

        {/* Inventario */}
        <div className="inventario-grid">
          {/* Inventario Total */}
          <div className="tarjeta-blanca">
            <h3 className="tarjeta-titulo">🏪 Inventario Total (Sala)</h3>
            <div className="inventario-info">
              <div className="inventario-row">
                <span className="inventario-label">Valor Total:</span>
                <span className="inventario-valor indigo">{formatearMoneda(resumen?.inventarioTotal?.valorTotal || 0)}</span>
              </div>
              <div className="inventario-secundario">
                <span>📦 {resumen?.inventarioTotal?.totalProductos || 0} productos</span>
                <span>{resumen?.inventarioTotal?.totalUnidades || 0} unidades</span>
              </div>
            </div>
            <p className="inventario-nota">Incluye todos los productos de la sala</p>
          </div>

          {/* Inventario de Venta */}
          <div className="tarjeta-blanca">
            <h3 className="tarjeta-titulo">💵 Inventario de Venta</h3>
            <div className="inventario-info">
              <div className="inventario-row">
                <span className="inventario-label">Valor Total:</span>
                <span className="inventario-valor verde">{formatearMoneda(resumen?.inventarioVenta?.valorTotal || 0)}</span>
              </div>
              <div className="inventario-secundario">
                <span>🛒 {resumen?.inventarioVenta?.totalProductos || 0} productos</span>
                <span>{resumen?.inventarioVenta?.totalUnidades || 0} unidades</span>
              </div>
              <div className="inventario-porcentaje">
                {((resumen?.inventarioVenta?.valorTotal / resumen?.inventarioTotal?.valorTotal) * 100 || 0).toFixed(1)}% del inventario total
              </div>
            </div>
          </div>
        </div>

        {/* Productos Más Vendidos */}
        <div className="tarjeta-blanca productos-mas-vendidos">
          <h3 className="tarjeta-titulo">🏆 Productos Más Vendidos</h3>
          <p className="tarjeta-subtitulo">Últimos 30 días</p>
          <div>
            {masVendidos.map((producto, index) => (
              <div key={index} className="producto-item">
                <div className="producto-izquierda">
                  <div className="producto-numero">#{index + 1}</div>
                  <div className="producto-info">
                    <h4>{producto.nombre}</h4>
                    <p>{producto.cantidadVendida} unidades</p>
                  </div>
                </div>
                <p className="producto-precio">{formatearMoneda(producto.totalVentas)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Productos Menos Vendidos */}
        <div className="tarjeta-blanca">
          <h3 className="tarjeta-titulo">📉 Productos Menos Vendidos</h3>
          <p className="tarjeta-subtitulo">Últimos 30 días (solo productos de venta)</p>
          <div className="menos-vendidos-grid">
            {menosVendidos.map((producto, index) => (
              <div key={index} className="producto-menos-vendido">
                <h4>{producto.nombre}</h4>
                <p>{producto.cantidadVendida} vendidas | Stock: {producto.stockActual}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="stock-grid">
          {/* Stock Bajo */}
          <div className="tarjeta-blanca">
            <h3 className="tarjeta-titulo">⚠️ Stock Bajo (Productos de Venta)</h3>
            <p className="tarjeta-subtitulo">Productos con inventario crítico</p>
            <div>
              {stockBajo.stockBajo?.length > 0 ? (
                stockBajo.stockBajo.map((producto, index) => (
                  <div key={index} className="stock-item bajo">
                    <div className="stock-info">
                      <h4>{producto.nombre}</h4>
                      <p>Solo quedan {producto.cantidad} unidades</p>
                    </div>
                    <div className="stock-icono">⚠️</div>
                  </div>
                ))
              ) : (
                <p className="sin-datos">No hay productos con stock bajo</p>
              )}
            </div>
          </div>

          {/* Productos Agotados */}
          <div className="tarjeta-blanca">
            <h3 className="tarjeta-titulo">❌ Productos Agotados (Venta)</h3>
            <p className="tarjeta-subtitulo">Requieren reabastecimiento urgente</p>
            <div>
              {stockBajo.agotados?.length > 0 ? (
                stockBajo.agotados.map((producto, index) => (
                  <div key={index} className="stock-item agotado">
                    <div className="stock-info">
                      <h4>{producto.nombre}</h4>
                      <p>Sin stock disponible</p>
                    </div>
                    <div className="stock-icono">❌</div>
                  </div>
                ))
              ) : (
                <p className="sin-datos">No hay productos agotados</p>
              )}
            </div>
          </div>
        </div>

        {/* Gráfica de Ventas */}
        <div className="tarjeta-blanca">
          <h3 className="tarjeta-titulo">📈 Ventas por Día</h3>
          <p className="tarjeta-subtitulo">Últimos 30 días</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                tickFormatter={(fecha) => new Date(fecha).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatearMoneda(value)}
                labelFormatter={(fecha) => new Date(fecha).toLocaleDateString('es-CR')}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={2} name="Total Ventas" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Estadísticas de Pedidos */}
        {estadisticasPedidos && (
          <div className="tarjeta-blanca">
            <h3 className="tarjeta-titulo">📦 Estadísticas de Pedidos</h3>
            <div className="pedidos-stats-grid">
              <div className="stat-pedido gris">
                <p className="stat-numero gris">{estadisticasPedidos.estadisticas?.total || 0}</p>
                <p className="stat-label">Total</p>
              </div>
              <div className="stat-pedido amarillo">
                <p className="stat-numero amarillo">{estadisticasPedidos.estadisticas?.pendientes || 0}</p>
                <p className="stat-label">Pendientes</p>
              </div>
              <div className="stat-pedido azul">
                <p className="stat-numero azul">{estadisticasPedidos.estadisticas?.confirmados || 0}</p>
                <p className="stat-label">Confirmados</p>
              </div>
              <div className="stat-pedido verde">
                <p className="stat-numero verde">{estadisticasPedidos.estadisticas?.completados || 0}</p>
                <p className="stat-label">Completados</p>
              </div>
              <div className="stat-pedido rojo">
                <p className="stat-numero rojo">{estadisticasPedidos.estadisticas?.cancelados || 0}</p>
                <p className="stat-label">Cancelados</p>
              </div>
            </div>

            <h4 className="pedidos-titulo">Pedidos Recientes</h4>
            <div>
              {estadisticasPedidos.recientes?.map((pedido, index) => (
                <div key={index} className="pedido-reciente">
                  <div className="pedido-izquierda">
                    {pedido.productoId?.imagen && (
                      <img src={pedido.productoId.imagen} alt="" className="pedido-imagen" />
                    )}
                    <div className="pedido-info">
                      <h4>{pedido.productoId?.nombre || 'Producto'}</h4>
                      <p>{pedido.nombreCliente} - {pedido.cantidad} unidades</p>
                    </div>
                  </div>
                  <span className={`pedido-estado ${pedido.estado}`}>
                    {pedido.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}