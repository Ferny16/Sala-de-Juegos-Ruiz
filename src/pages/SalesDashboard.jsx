import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/SalesDashboard.css";

const API_URL = process.env.REACT_APP_API_URL;

const SalesDashboard = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [search, setSearch] = useState("");
  const [montoPagado, setMontoPagado] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingVenta, setProcessingVenta] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [ventaExitosa, setVentaExitosa] = useState(null);
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  const fetchProductos = useCallback(
    async (searchTerm = "") => {
      setLoading(true);
      try {
        const url = searchTerm
          ? `${API_URL}/api/products/para-venta?search=${encodeURIComponent(searchTerm)}`
          : `${API_URL}/api/products/para-venta`;

        const response = await axios.get(url, getAuthHeaders());
        setProductos(response.data.productos || response.data);
      } catch (error) {
        console.error("❌ Error al cargar productos:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert("⚠️ Sesión expirada. Por favor inicia sesión nuevamente.");
        } else {
          alert("Error al cargar productos.");
        }
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    fetchProductos("");
    document.title = "Ventas - Sala de Juegos Ruiz";
  }, [fetchProductos]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProductos(search);
  };

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find((item) => item._id === producto._id);

    if (existe) {
      if (existe.cantidadVenta >= producto.cantidad) {
        setMostrarNotificacion(true);
        setVentaExitosa({
          esError: true,
          mensaje: `Stock insuficiente`,
          detalle: `Solo ${producto.cantidad === 1 ? "hay 1 unidad disponible" : `hay ${producto.cantidad} unidades disponibles`} de "${producto.nombre}"`,
          tipo: "warning",
        });
        setTimeout(() => setMostrarNotificacion(false), 3500);
        return;
      }
      setCarrito(
        carrito.map((item) =>
          item._id === producto._id
            ? { ...item, cantidadVenta: item.cantidadVenta + 1 }
            : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidadVenta: 1 }]);
      setMostrarNotificacion(true);
      setVentaExitosa({
        esError: false,
        mensaje: `Producto agregado`,
        detalle: `"${producto.nombre}" añadido al carrito`,
        tipo: "success",
      });
      setTimeout(() => setMostrarNotificacion(false), 2000);
    }
  };

  const cambiarCantidad = (id, nuevaCantidad) => {
    const producto = productos.find((p) => p._id === id);

    if (nuevaCantidad > producto.cantidad) {
      setMostrarNotificacion(true);
      setVentaExitosa({
        esError: true,
        mensaje: `Stock insuficiente`,
        detalle: `Solo ${producto.cantidad === 1 ? "hay 1 unidad disponible" : `hay ${producto.cantidad} unidades disponibles`}`,
        tipo: "warning",
      });
      setTimeout(() => setMostrarNotificacion(false), 3500);
      return;
    }

    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }

    setCarrito(
      carrito.map((item) =>
        item._id === id ? { ...item, cantidadVenta: nuevaCantidad } : item
      )
    );
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item._id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.precioVenta * item.cantidadVenta,
      0
    );
  };

  const calcularVuelto = () => {
    const total = calcularTotal();
    const pago = parseFloat(montoPagado) || 0;
    const vuelto = pago - total;
    return vuelto;
  };

  const vaciarCarrito = () => {
    if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
      setCarrito([]);
      setMontoPagado("");
      setMostrarResultado(false);
    }
  };

  const procesarVenta = async () => {
    const total = calcularTotal();
    const pago = parseFloat(montoPagado) || 0;
    const vuelto = pago - total;

    if (carrito.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    if (!montoPagado || pago <= 0) {
      alert("Por favor ingresa el monto pagado por el cliente");
      return;
    }

    if (pago < total) {
      alert(
        `❌ El monto pagado (₡${pago.toFixed(2)}) es insuficiente.\n\nTotal a pagar: ₡${total.toFixed(2)}\nFalta: ₡${(total - pago).toFixed(2)}`
      );
      return;
    }

    setProcessingVenta(true);

    try {
      const ventaData = {
        productos: carrito.map((item) => ({
          productoId: item._id,
          nombre: item.nombre,
          cantidad: item.cantidadVenta,
          precioVenta: item.precioVenta,
          subtotal: item.precioVenta * item.cantidadVenta,
        })),
        total: total,
        montoPagado: pago,
        vuelto: vuelto,
        fecha: new Date().toISOString(),
      };

      const ventaResponse = await axios.post(
        `${API_URL}/api/sales`,
        ventaData,
        getAuthHeaders()
      );

      for (const item of carrito) {
        const nuevaCantidad = item.cantidad - item.cantidadVenta;
        await axios.put(
          `${API_URL}/api/products/${item._id}`,
          { cantidad: nuevaCantidad },
          getAuthHeaders()
        );
      }

      setVentaExitosa({
        total: total,
        pagado: pago,
        vuelto: vuelto,
        productos: carrito,
        numeroVenta: ventaResponse.data.venta?._id || ventaResponse.data._id,
      });
      setMostrarResultado(true);

      setCarrito([]);
      setMontoPagado("");
      fetchProductos(search);
    } catch (error) {
      console.error("❌ ERROR:", error);
      if (error.response?.status === 401) {
        alert("⚠️ Sesión expirada. Por favor inicia sesión nuevamente.");
        return;
      }
      if (error.response?.status === 403) {
        alert("⚠️ No tienes permisos para realizar esta acción.");
        return;
      }
      alert("Error al procesar la venta");
    } finally {
      setProcessingVenta(false);
    }
  };

  if (loading) {
    return (
      <div className="sales-container">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
          <div className="container-fluid">
            <Link className="navbar-brand fw-bold" to="/">
              Sala de Juegos Ruiz
            </Link>
          </div>
        </nav>
        <div className="loading-container">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sales-container">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark w-100">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            🎮 Sala de Juegos Ruiz
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
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

      <div className="sales-content">
        <div className="container-fluid py-4">
          <h2 className="sales-title text-center mb-4">💰 Sistema de Ventas</h2>

          <div className="row g-4">
            {/* Panel derecho - Carrito PRIMERO (en móvil aparece arriba) */}
            <div className="col-lg-5 order-lg-2">
              <div className="card carrito-panel">
                <div className="card-header">
                  <h5 className="mb-0">📦 Productos Disponibles</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSearch} className="mb-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar producto..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <button className="btn btn-primary" type="submit">
                        🔍
                      </button>
                      {search && (
                        <button
                          className="btn btn-secondary"
                          type="button"
                          onClick={() => {
                            setSearch("");
                            fetchProductos("");
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="productos-lista">
                    {productos.length === 0 ? (
                      <div className="alert alert-info">
                        📦 No hay productos disponibles
                      </div>
                    ) : (
                      productos.map((producto) => (
                        <div key={producto._id} className="producto-item">
                          <img
                            src={
                              producto.imagenOptimizada ||
                              producto.imagen ||
                              "https://via.placeholder.com/60"
                            }
                            alt={producto.nombre}
                            className="producto-img"
                          />
                          <div className="producto-info">
                            <h6 className="producto-nombre">
                              {producto.nombre}
                            </h6>
                            <p className="producto-detalles">
                              <span className="precio">
                                ₡{producto.precioVenta}
                              </span>
                              <span className="stock">
                                Stock: {producto.cantidad}
                              </span>
                            </p>
                          </div>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => agregarAlCarrito(producto)}
                          >
                            + Agregar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Panel izquierdo - Productos DESPUÉS (en móvil aparece abajo) */}
            <div className="col-lg-7 order-lg-1">
              <div className="card productos-panel">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">🛒 Carrito de Venta</h5>
                  {carrito.length > 0 && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={vaciarCarrito}
                    >
                      🗑️ Vaciar
                    </button>
                  )}
                </div>
                <div className="card-body">
                  {carrito.length === 0 ? (
                    <div className="carrito-vacio">
                      <p>🛒 Carrito vacío</p>
                      <small>Agrega productos para iniciar una venta</small>
                    </div>
                  ) : (
                    <>
                      <div className="carrito-items">
                        {carrito.map((item) => (
                          <div key={item._id} className="carrito-item">
                            <div className="item-info">
                              <h6>{item.nombre}</h6>
                              <p className="item-precio">
                                ₡{item.precioVenta} c/u
                              </p>
                            </div>
                            <div className="item-controls">
                              <div className="cantidad-controls">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    cambiarCantidad(
                                      item._id,
                                      item.cantidadVenta - 1
                                    )
                                  }
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  className="form-control form-control-sm cantidad-input"
                                  value={item.cantidadVenta}
                                  onChange={(e) =>
                                    cambiarCantidad(
                                      item._id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  min="1"
                                  max={item.cantidad}
                                />
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() =>
                                    cambiarCantidad(
                                      item._id,
                                      item.cantidadVenta + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                              <div className="item-subtotal">
                                ₡
                                {(
                                  item.precioVenta * item.cantidadVenta
                                ).toFixed(2)}
                              </div>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => eliminarDelCarrito(item._id)}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="total-section">
                        <div className="total-row">
                          <span>Total a Pagar:</span>
                          <strong className="total-amount">
                            ₡{calcularTotal().toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      <div className="pago-section">
                        <label className="form-label fw-bold">
                          💵 Monto Pagado:
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-lg"
                          placeholder="Ingrese el monto que paga el cliente"
                          value={montoPagado}
                          onChange={(e) => setMontoPagado(e.target.value)}
                          step="0.01"
                          min="0"
                        />

                        {montoPagado && parseFloat(montoPagado) > 0 && (
                          <div
                            className={`vuelto-display ${calcularVuelto() >= 0 ? "positivo" : "negativo"}`}
                          >
                            <span>Vuelto:</span>
                            <strong>₡{calcularVuelto().toFixed(2)}</strong>
                            {calcularVuelto() < 0 && (
                              <small className="d-block text-center mt-1">
                                ⚠️ Falta: ₡
                                {Math.abs(calcularVuelto()).toFixed(2)}
                              </small>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-success btn-lg w-100 mt-3"
                        onClick={procesarVenta}
                        disabled={
                          processingVenta ||
                          !montoPagado ||
                          calcularVuelto() < 0
                        }
                      >
                        {processingVenta ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Procesando...
                          </>
                        ) : (
                          <>✅ Procesar Venta</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarResultado && ventaExitosa && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarResultado(false)}
        >
          <div className="modal-resultado" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-resultado">
              <h3>✅ Venta Exitosa</h3>
            </div>
            <div className="modal-body-resultado">
              <div className="resultado-row">
                <span>Total:</span>
                <strong>₡{ventaExitosa.total.toFixed(2)}</strong>
              </div>
              <div className="resultado-row">
                <span>Pagado:</span>
                <strong>₡{ventaExitosa.pagado.toFixed(2)}</strong>
              </div>
              <div className="resultado-row vuelto-final">
                <span>Vuelto:</span>
                <strong>₡{ventaExitosa.vuelto.toFixed(2)}</strong>
              </div>

              <div className="productos-vendidos">
                <h6>Productos vendidos:</h6>
                <ul>
                  {ventaExitosa.productos.map((p, i) => (
                    <li key={i}>
                      {p.nombre} x{p.cantidadVenta} = ₡
                      {(p.precioVenta * p.cantidadVenta).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="modal-footer-resultado">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMostrarResultado(false);
                  setTimeout(() => {
                    setMostrarNotificacion(true);
                    setTimeout(() => {
                      setMostrarNotificacion(false);
                    }, 4000);
                  }, 300);
                }}
              >
                ✅ Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarNotificacion && ventaExitosa && (
        <div className={`notificacion-exito ${ventaExitosa.tipo || "success"}`}>
          <div className="notificacion-contenido">
            <div className="notificacion-icono">
              {ventaExitosa.tipo === "warning"
                ? "⚠️"
                : ventaExitosa.esError
                  ? "❌"
                  : "✅"}
            </div>
            <div className="notificacion-texto">
              <h4>
                {ventaExitosa.mensaje || "¡Venta Procesada Exitosamente!"}
              </h4>
              {ventaExitosa.detalle && <p>{ventaExitosa.detalle}</p>}
              {!ventaExitosa.esError && ventaExitosa.total && (
                <>
                  <p>
                    Total: ₡{ventaExitosa.total.toFixed(2)} | Vuelto: ₡
                    {ventaExitosa.vuelto.toFixed(2)}
                  </p>
                  <small>El inventario ha sido actualizado</small>
                </>
              )}
            </div>
            <button
              className="notificacion-cerrar"
              onClick={() => setMostrarNotificacion(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;