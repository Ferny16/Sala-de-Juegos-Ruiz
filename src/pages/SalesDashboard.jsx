import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/SalesDashboard.css";

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

  // ✅ CONFIGURAR AXIOS CON TOKEN
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
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/para-venta?search=${searchTerm}`,
          getAuthHeaders()
        );
        setProductos(response.data.productos);
      } catch (error) {
        console.error("❌ Error al cargar productos:", error);

        if (error.response?.status === 401 || error.response?.status === 403) {
          alert("⚠️ Sesión expirada. Por favor inicia sesión nuevamente.");
          // window.location.href = '/login';
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

  // Buscar productos
  const handleSearch = (e) => {
    e.preventDefault();
    fetchProductos(search);
  };

  // Agregar producto al carrito
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

  // Cambiar cantidad en carrito
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

  // Eliminar del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter((item) => item._id !== id));
  };

  // Calcular total
  const calcularTotal = () => {
    return carrito.reduce(
      (total, item) => total + item.precioVenta * item.cantidadVenta,
      0
    );
  };

  // Calcular vuelto
  const calcularVuelto = () => {
    const total = calcularTotal();
    const pago = parseFloat(montoPagado) || 0;
    const vuelto = pago - total;
    return vuelto;
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    if (window.confirm("¿Estás seguro de vaciar el carrito?")) {
      setCarrito([]);
      setMontoPagado("");
      setMostrarResultado(false);
    }
  };

  // Procesar venta
  const procesarVenta = async () => {
    const total = calcularTotal();
    const pago = parseFloat(montoPagado) || 0;
    const vuelto = pago - total;

    console.log("🛒 Iniciando proceso de venta...");
    console.log("📊 Datos del carrito:", {
      totalProductos: carrito.length,
      total,
      montoPagado: pago,
      vuelto,
    });

    // Validaciones del frontend
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
      // Preparar datos de venta
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

      console.log("📦 Enviando datos al backend:", ventaData);
      console.log("🔑 Headers de autorización:", getAuthHeaders());

      // ✅ REGISTRAR VENTA CON TOKEN
      const ventaResponse = await axios.post(
        `${API_URL}/sales`,
        ventaData,
        getAuthHeaders()
      );

      console.log("✅ Respuesta del backend:", ventaResponse.data);

      // Actualizar inventario para cada producto
      console.log("🔄 Actualizando inventario...");
      for (const item of carrito) {
        const nuevaCantidad = item.cantidad - item.cantidadVenta;

        console.log(
          `📦 Actualizando ${item.nombre}: ${item.cantidad} -> ${nuevaCantidad}`
        );

        await axios.put(
          `http://localhost:5000/api/products/${item._id}`,
          { cantidad: nuevaCantidad },
          getAuthHeaders()
        );
      }

      console.log("✅ Inventario actualizado correctamente");

      // Mostrar resultado exitoso
      setVentaExitosa({
        total: total,
        pagado: pago,
        vuelto: vuelto,
        productos: carrito,
        numeroVenta: ventaResponse.data.venta._id,
      });
      setMostrarResultado(true);

      // Limpiar carrito y formulario
      setCarrito([]);
      setMontoPagado("");

      // Recargar productos actualizados
      fetchProductos(search);
    } catch (error) {
      console.error("❌ ERROR COMPLETO:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error response data:", error.response?.data);

      // ✅ MANEJO ESPECIAL PARA ERRORES DE AUTENTICACIÓN
      if (error.response?.status === 401) {
        alert(
          "⚠️ Sesión expirada o no autorizada.\n\nPor favor inicia sesión nuevamente."
        );
        // Opcional: redirigir al login
        // window.location.href = '/login';
        return;
      }

      if (error.response?.status === 403) {
        alert("⚠️ No tienes permisos para realizar esta acción.");
        return;
      }

      // Manejar errores específicos del backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        console.log("📦 Datos del error recibido:", errorData);

        if (errorData.detalles) {
          if (typeof errorData.detalles === "string") {
            alert(`❌ ${errorData.error}\n\n${errorData.detalles}`);
          } else if (errorData.detalles.total !== undefined) {
            alert(
              `❌ ${errorData.error}\n\nTotal: ₡${errorData.detalles.total}\nPagado: ₡${errorData.detalles.montoPagado}\nFaltante: ₡${errorData.detalles.faltante}`
            );
          } else {
            alert(
              `❌ ${errorData.error}\n\n${JSON.stringify(errorData.detalles)}`
            );
          }
        } else if (errorData.producto) {
          const prod = errorData.producto;
          let mensaje = `❌ ${errorData.error}\n\nProducto: ${prod.nombre || "Desconocido"}`;

          if (prod.mensaje) {
            mensaje += `\n${prod.mensaje}`;
          }
          if (prod.disponible !== undefined) {
            mensaje += `\nDisponible: ${prod.disponible}`;
            mensaje += `\nSolicitado: ${prod.solicitado}`;
          }
          if (prod.precioActual !== undefined) {
            mensaje += `\nPrecio actual: ₡${prod.precioActual}`;
            mensaje += `\nPrecio en carrito: ₡${prod.precioEnCarrito}`;
          }

          alert(mensaje);
        } else if (errorData.error) {
          const mensaje = errorData.mensaje
            ? `❌ ${errorData.error}\n\n${errorData.mensaje}`
            : `❌ ${errorData.error}`;
          alert(mensaje);
        } else {
          console.error("⚠️ Estructura de error desconocida:", errorData);
          alert(
            `❌ Error al procesar la venta\n\n${JSON.stringify(errorData)}`
          );
        }
      } else if (error.request) {
        console.error("❌ No se recibió respuesta del servidor");
        alert(
          "❌ No se pudo conectar con el servidor.\n\nVerifica que el backend esté corriendo en http://localhost:5000"
        );
      } else {
        console.error("❌ Error al configurar la petición:", error.message);
        alert(`❌ Error al procesar la venta.\n\n${error.message}`);
      }
    } finally {
      setProcessingVenta(false);
      console.log("🏁 Proceso de venta finalizado");
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
      {/* Navbar */}
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

      {/* Contenido principal */}
      <div className="sales-content">
        <div className="container-fluid py-4">
          <h2 className="sales-title text-center mb-4">💰 Sistema de Ventas</h2>

          <div className="row g-4">
            {/* Panel izquierdo - Productos */}
            <div className="col-lg-7">
              <div className="card productos-panel">
                <div className="card-header">
                  <h5 className="mb-0">📦 Productos Disponibles</h5>
                </div>
                <div className="card-body">
                  {/* Buscador */}
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

                  {/* Lista de productos */}
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

            {/* Panel derecho - Carrito y Pago */}
            <div className="col-lg-5">
              <div className="card carrito-panel sticky-top">
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
                  {/* Items del carrito */}
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

                      {/* Total */}
                      <div className="total-section">
                        <div className="total-row">
                          <span>Total a Pagar:</span>
                          <strong className="total-amount">
                            ₡{calcularTotal().toFixed(2)}
                          </strong>
                        </div>
                      </div>

                      {/* Pago */}
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

                      {/* Botón procesar */}
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

      {/* Modal de resultado */}
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

      {/* Notificación */}
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
