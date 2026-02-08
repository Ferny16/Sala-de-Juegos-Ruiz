/**
 * ManageProducts Component
 *
 * Componente principal para la gestión de productos del inventario.
 * Permite visualizar, buscar, editar y eliminar productos desde una interfaz unificada.
 *
 * Características principales:
 * - Listado completo de productos con paginación
 * - Búsqueda en tiempo real por nombre de producto
 * - Edición inline de productos (nombre, cantidad, precios, fecha, disponibilidad)
 * - **NUEVO**: Modificación opcional de imagen
 * - Eliminación de productos con confirmación
 * - Visualización de imágenes con zoom
 * - Control de disponibilidad para venta
 * - Auditoría de cambios (quién modificó)
 * - Interfaz responsive y optimizada
 *
 * @component
 * @author jefernee
 * @version 2.2.0
 */

import { useState, useEffect } from "react";
import axios from "axios";
import { Helmet } from "react-helmet";
import "../styles/ManageProducts.css";
import Navbar from "../components/NavBar2";

const ManageProducts = () => {
  // ===================================
  // ESTADO DEL COMPONENTE
  // ===================================

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [imagenesNuevas, setImagenesNuevas] = useState({}); // ✅ NUEVO: { productoId: { file, preview } }

  // ===================================
  // FUNCIONES DE CARGA DE DATOS
  // ===================================

  /**
   * Obtiene la lista de productos del servidor
   * @async
   * @param {string} searchTerm - Término de búsqueda opcional
   */
  const fetchProductos = async (searchTerm = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/products/list?page=1&limit=100&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Productos cargados:", response.data);
      setProductos(response.data.productos);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      if (error.response?.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión nuevamente.");
      } else {
        alert("Error al cargar productos.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================================
  // EFECTOS (LIFECYCLE)
  // ===================================

  useEffect(() => {
    fetchProductos("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===================================
  // MANEJADORES DE EVENTOS
  // ===================================

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProductos(search);
  };

  /**
   * Inicia el modo de edición para un producto
   * @param {Object} producto - Objeto producto a editar
   */
  const handleStartEdit = (producto) => {
    setEditingProduct(producto._id);

    setEditForm({
      nombre: producto.nombre,
      cantidad: producto.cantidad,
      precioCompra: producto.precioCompra,
      precioVenta: producto.precioVenta,
      fechaCompra: producto.fechaCompra.split("T")[0],
      seVende: producto.seVende,
    });

    // ✅ Limpiar imagen de este producto específico
    setImagenesNuevas((prev) => {
      const newState = { ...prev };
      delete newState[producto._id];
      return newState;
    });
  };

  const handleCancelEdit = () => {
    const productoId = editingProduct;
    setEditingProduct(null);
    setEditForm({});

    // ✅ Limpiar imagen del producto que se estaba editando
    if (productoId) {
      setImagenesNuevas((prev) => {
        const newState = { ...prev };
        delete newState[productoId];
        return newState;
      });
    }
  };

  // ✅ Manejar selección de imagen
  const handleImageChange = (e, productoId) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenesNuevas((prev) => ({
          ...prev,
          [productoId]: {
            file: file,
            preview: reader.result,
          },
        }));
        console.log(
          `✅ Imagen cargada para producto ${productoId}:`,
          file.name
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Limpiar imagen seleccionada
  const handleClearImage = (productoId) => {
    setImagenesNuevas((prev) => {
      const newState = { ...prev };
      delete newState[productoId];
      return newState;
    });
    console.log(`🗑️ Imagen eliminada para producto ${productoId}`);
  };

  /**
   * Guarda los cambios realizados en un producto
   * @async
   * @param {string} id - ID del producto a actualizar
   * @param {string} nombre - Nombre del producto
   */
  const handleSaveEdit = async (id, nombre) => {
    if (!editForm.nombre || !editForm.cantidad || !editForm.precioVenta) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    setProcessing(id);

    try {
      const token = localStorage.getItem("token");

      // ✅ Obtener imagen del producto específico
      const imagenData = imagenesNuevas[id];
      const nuevaImagen = imagenData?.file;

      console.log("🚀 Iniciando actualización...");
      console.log("ID:", id);
      console.log("Datos:", editForm);
      console.log("¿Tiene nueva imagen?", !!nuevaImagen);
      if (nuevaImagen) {
        console.log("📷 Nombre de archivo:", nuevaImagen.name);
      }

      // ✅ Siempre usar FormData (funciona con o sin imagen)
      const formData = new FormData();
      formData.append("nombre", editForm.nombre);
      formData.append("cantidad", editForm.cantidad);
      formData.append("precioCompra", editForm.precioCompra);
      formData.append("precioVenta", editForm.precioVenta);
      formData.append("fechaCompra", editForm.fechaCompra);
      formData.append("seVende", editForm.seVende);

      // ✅ IMPORTANTE: Solo agregar imagen si el usuario seleccionó una
      if (nuevaImagen) {
        formData.append("imagen", nuevaImagen);
        console.log("✅ Imagen agregada al FormData");
      } else {
        console.log("ℹ️ Sin nueva imagen - se mantendrá la actual");
      }

      console.log("📤 Enviando petición PUT...");

      // ✅ NO especificar Content-Type - el navegador lo hace automáticamente
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Respuesta del servidor:", response.data);

      // Recargar productos
      await fetchProductos(search);

      alert(`"${nombre}" actualizado correctamente.`);

      // Limpiar estados
      setEditingProduct(null);
      setEditForm({});
      setImagenesNuevas((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (error) {
      console.error("❌ Error al actualizar:", error);
      console.error("Respuesta del error:", error.response?.data);

      if (error.response?.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión nuevamente.");
      } else {
        alert(
          `Error al actualizar el producto: ${error.response?.data?.error || error.message}`
        );
      }
    } finally {
      setProcessing(null);
    }
  };

  /**
   * Elimina un producto del inventario
   * @async
   * @param {string} id - ID del producto a eliminar
   * @param {string} nombre - Nombre del producto
   */
  const handleDelete = async (id, nombre) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar "${nombre}"?\n\nEsta acción eliminará el producto y todos sus datos relacionados (disponibilidad, auditoría, etc).\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    setProcessing(id);

    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Filtra el producto eliminado del estado local
      setProductos(productos.filter((p) => p._id !== id));

      alert(
        `"${nombre}" y todos sus datos relacionados fueron eliminados correctamente.`
      );
    } catch (error) {
      console.error("Error al eliminar:", error);
      if (error.response?.status === 401) {
        alert("Sesión expirada. Por favor inicia sesión nuevamente.");
      } else {
        alert("Error al eliminar el producto.");
      }
    } finally {
      setProcessing(null);
    }
  };

  // ===================================
  // RENDER CONDICIONAL - LOADING
  // ===================================

  if (loading) {
    return (
      <div className="manage-products-container">
        <Navbar />

        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // ===================================
  // RENDER PRINCIPAL
  // ===================================

  return (
    <div className="manage-products-container">
      <Helmet>
        <title>Gestionar Productos - Sala de Juegos Ruiz</title>
      </Helmet>

      {/* ============= NAVBAR ============= */}
      <Navbar />

      {/* ============= CONTENIDO PRINCIPAL ============= */}
      <div className="manage-content">
        <div className="container py-4">
          <div className="text-center mb-4">
            <h2 className="manage-title mb-3">🎮 Gestionar Productos</h2>
            <p className="subtitle">
              Ver, editar y eliminar productos desde un solo lugar
            </p>
          </div>

          {/* ===== BARRA DE BÚSQUEDA ===== */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group search-bar">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="btn btn-primary" type="submit">
                🔍 Buscar
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
                  ✕ Limpiar
                </button>
              )}
            </div>
          </form>

          {/* ===== CONTADOR DE RESULTADOS ===== */}
          {productos.length > 0 && (
            <p className="text-muted text-center mb-3">
              {productos.length} producto{productos.length !== 1 ? "s" : ""}
              encontrado{productos.length !== 1 ? "s" : ""}
              {search && ` para "${search}"`}
            </p>
          )}

          {/* ===== LISTA DE PRODUCTOS ===== */}
          {productos.length === 0 ? (
            <div className="alert alert-info text-center">
              📦 No se encontraron productos{" "}
              {search && `con el término "${search}"`}
            </div>
          ) : (
            <div className="products-list">
              {productos.map((producto) => (
                <div key={producto._id} className="product-item">
                  {/* ===== IMAGEN DEL PRODUCTO ===== */}
                  <div className="product-image-wrapper">
                    <img
                      src={
                        imagenesNuevas[producto._id]?.preview ||
                        producto.imagenOptimizada ||
                        producto.imagen ||
                        "https://via.placeholder.com/100"
                      }
                      alt={producto.nombre}
                      className="product-thumbnail"
                      onClick={() =>
                        window.open(
                          producto.imagenOriginal || producto.imagen,
                          "_blank"
                        )
                      }
                      title="Click para ver imagen completa"
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  {/* ===== DETALLES O FORMULARIO ===== */}
                  <div className="product-details">
                    {editingProduct === producto._id ? (
                      // ===== MODO EDICIÓN =====
                      <div className="edit-form">
                        <div className="row g-2">
                          {/* Campo: Nombre */}
                          <div className="col-12">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Nombre"
                              value={editForm.nombre}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  nombre: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Campo: Cantidad */}
                          <div className="col-6 col-md-3">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Cantidad"
                              value={editForm.cantidad}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  cantidad: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Campo: Precio de Compra */}
                          <div className="col-6 col-md-3">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="P. Compra"
                              value={editForm.precioCompra}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  precioCompra: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Campo: Precio de Venta */}
                          <div className="col-6 col-md-3">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="P. Venta"
                              value={editForm.precioVenta}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  precioVenta: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Campo: Fecha de Compra */}
                          <div className="col-6 col-md-3">
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={editForm.fechaCompra}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  fechaCompra: e.target.value,
                                })
                              }
                            />
                          </div>

                          {/* Campo Se Vende */}
                          <div className="col-12">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`seVende-${producto._id}`}
                                checked={editForm.seVende}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    seVende: e.target.checked,
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`seVende-${producto._id}`}
                              >
                                Disponible para venta
                              </label>
                            </div>
                          </div>

                          {/* ✅ Campo de imagen opcional */}
                          <div className="col-12">
                            <label
                              className="form-label text-muted"
                              style={{ fontSize: "0.85rem" }}
                            >
                              📷 Cambiar imagen (opcional)
                            </label>
                            <div className="d-flex gap-2 align-items-center">
                              <input
                                type="file"
                                className="form-control form-control-sm"
                                accept="image/*"
                                onChange={(e) => {
                                  console.log("🔍 EVENTO DISPARADO");
                                  console.log(
                                    "Archivo seleccionado:",
                                    e.target.files[0]
                                  );
                                  console.log("ID del producto:", producto._id);
                                  handleImageChange(e, producto._id);
                                }}
                              />
                              {imagenesNuevas[producto._id] && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleClearImage(producto._id)}
                                  title="Quitar imagen seleccionada"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            {imagenesNuevas[producto._id] && (
                              <small className="text-success d-block mt-1">
                                ✓ Nueva imagen seleccionada:{" "}
                                {imagenesNuevas[producto._id].file.name}
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // ===== VISTA NORMAL =====
                      <>
                        <h5 className="product-name">
                          {producto.nombre}
                          {/* Badge de disponibilidad */}
                          {producto.seVende ? (
                            <span
                              className="badge bg-success ms-2"
                              style={{ fontSize: "0.7rem" }}
                            >
                              ✓ Disponible
                            </span>
                          ) : (
                            <span
                              className="badge bg-secondary ms-2"
                              style={{ fontSize: "0.7rem" }}
                            >
                              ✕ No disponible
                            </span>
                          )}
                        </h5>

                        <div className="product-meta">
                          <span className="meta-item">
                            <strong>Cantidad:</strong> {producto.cantidad}
                          </span>
                          <span className="meta-item">
                            <strong>P. Compra:</strong> ₡{producto.precioCompra}
                          </span>
                          <span className="meta-item">
                            <strong>P. Venta:</strong> ₡{producto.precioVenta}
                          </span>
                          <span className="meta-item">
                            <strong>Fecha:</strong>{" "}
                            {new Date(producto.fechaCompra).toLocaleDateString(
                              "es-ES"
                            )}
                          </span>
                          {/* Información de auditoría */}
                          {producto.createdBy && (
                            <span
                              className="meta-item text-muted"
                              style={{ fontSize: "0.85em" }}
                            >
                              <strong>Creado por:</strong>{" "}
                              {producto.createdBy.nombre ||
                                producto.createdBy.email}
                            </span>
                          )}
                          {producto.updatedAt && (
                            <span
                              className="meta-item text-muted"
                              style={{ fontSize: "0.85em" }}
                            >
                              <strong>Última edición:</strong>{" "}
                              {new Date(producto.updatedAt).toLocaleDateString(
                                "es-ES"
                              )}{" "}
                              {new Date(producto.updatedAt).toLocaleTimeString(
                                "es-ES"
                              )}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* ===== BOTONES DE ACCIÓN ===== */}
                  <div className="product-actions">
                    {editingProduct === producto._id ? (
                      <div className="edit-actions">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleSaveEdit(producto._id, producto.nombre)
                          }
                          disabled={processing === producto._id}
                        >
                          {processing === producto._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Guardando...
                            </>
                          ) : (
                            <>💾 Guardar</>
                          )}
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEdit}
                          disabled={processing === producto._id}
                        >
                          ✕ Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="normal-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleStartEdit(producto)}
                          disabled={processing === producto._id}
                        >
                          ✏️ Editar
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(producto._id, producto.nombre)
                          }
                          disabled={processing === producto._id}
                        >
                          {processing === producto._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Eliminando...
                            </>
                          ) : (
                            <>🗑️ Eliminar</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
