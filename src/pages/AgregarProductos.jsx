// src/pages/AgregarProductos.jsx
import { useState, useRef } from "react";
import axios from "axios";
import "../styles/AgregarProductos.css";
import { Link, useNavigate } from "react-router-dom";
import ImageUploadWithCompression from "../components/ImageUploadWithCompression";

const AgregarProductos = () => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    precioCompra: "",
    precioVenta: "",
    fechaCompra: "",
    imagen: null,
    seVende: true,
  });
  const [toast, setToast] = useState({ show: false, text: "", type: "" });
  const imageUploadRef = useRef(null);
  const navigate = useNavigate();

  /**
   * Muestra un mensaje toast
   */
  const showToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type: "" });
    }, 3000);
  };

  /**
   * Maneja los cambios en los inputs del formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /**
   * Maneja la imagen comprimida que viene del componente
   */
  const handleImageChange = (compressedFile) => {
    setForm({ ...form, imagen: compressedFile });
  };

  /**
   * Maneja errores al procesar la imagen
   */
  const handleImageError = (error) => {
    console.error("Error procesando imagen:", error);
    showToast("Error al procesar la imagen", "error");
  };

  /**
   * Maneja el envío del formulario
   */
  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Evita doble submit
    if (uploading) return;

    setUploading(true);

    try {
      // Crear FormData con todos los campos
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      // Obtener token de autenticación
      const token = localStorage.getItem("token");

      if (!token) {
        showToast("Debes iniciar sesión para agregar productos", "error");
        return;
      }

      // Enviar petición al backend
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/products`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showToast("Producto agregado correctamente");

      // Resetear formulario
      setForm({
        nombre: "",
        cantidad: "",
        precioCompra: "",
        precioVenta: "",
        fechaCompra: "",
        imagen: null,
        seVende: true,
      });

      // Resetear componente de imagen
      imageUploadRef.current?.reset();
    } catch (error) {
      console.error("Error al agregar producto:", error);

      // Manejo específico de errores
      if (error.response?.status === 401) {
        showToast(
          "Sesión expirada. Por favor inicia sesión nuevamente.",
          "error"
        );
      } else if (error.response?.data?.error) {
        showToast(error.response.data.error, "error");
      } else {
        showToast("Error al agregar producto", "error");
      }
    } finally {
      setUploading(false);
    }
  };

  /**
   * Cierra el formulario y vuelve al dashboard
   */
  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-container">
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
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto gap-2">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/pedidos">
                  📦 Pedidos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/reportes">
                  📈 Reportes
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard/sales">
                  💰 Ventas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/dashboard/add-product">
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

      {/* Toast de notificaciones */}
      {toast.show && (
        <div className={`toast-custom ${toast.type}`}>{toast.text}</div>
      )}

      {/* Contenedor principal */}
      <div
        className="container-fluid d-flex justify-content-center align-items-center py-4"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div className="square-container position-relative p-4 bg-white rounded shadow">
          {/* Botón cerrar */}
          <button
            className="btn-close position-absolute"
            style={{ top: "15px", right: "15px" }}
            onClick={handleClose}
            aria-label="Volver al menú"
            disabled={uploading}
          ></button>

          <h2 className="text-center mb-4">Agregar Producto</h2>

          <form className="row g-3" onSubmit={handleAddProduct}>
            {/* Nombre */}
            <div className="col-md-6">
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-control"
                value={form.nombre}
                onChange={handleChange}
                required
                disabled={uploading}
              />
            </div>

            {/* Cantidad */}
            <div className="col-md-3">
              <label htmlFor="cantidad" className="form-label">
                Cantidad
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="0"
                className="form-control"
                value={form.cantidad}
                onChange={handleChange}
                required
                disabled={uploading}
              />
            </div>

            {/* Fecha */}
            <div className="col-md-3">
              <label htmlFor="fechaCompra" className="form-label">
                Fecha
              </label>
              <input
                id="fechaCompra"
                name="fechaCompra"
                type="date"
                className="form-control"
                value={form.fechaCompra}
                onChange={handleChange}
                required
                disabled={uploading}
              />
            </div>

            {/* Precio Compra */}
            <div className="col-md-4">
              <label htmlFor="precioCompra" className="form-label">
                Precio Compra
              </label>
              <input
                id="precioCompra"
                name="precioCompra"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.precioCompra}
                onChange={handleChange}
                required
                disabled={uploading}
              />
            </div>

            {/* Precio Venta */}
            <div className="col-md-4">
              <label htmlFor="precioVenta" className="form-label">
                Precio Venta
              </label>
              <input
                id="precioVenta"
                name="precioVenta"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={form.precioVenta}
                onChange={handleChange}
                required
                disabled={uploading}
              />
            </div>

            {/* Disponible para venta */}
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="seVende"
                  name="seVende"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.seVende}
                  onChange={handleChange}
                  disabled={uploading}
                />
                <label className="form-check-label" htmlFor="seVende">
                  Disponible para venta
                </label>
              </div>
            </div>

            {/* Imagen con compresión */}
            <div className="col-12">
              <label className="form-label">Imagen</label>
              <ImageUploadWithCompression
                onChange={handleImageChange}
                onError={handleImageError}
                required
                disabled={uploading}
                showPreview={true}
                ref={imageUploadRef}
              />
            </div>

            {/* Botón submit */}
            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Subiendo...
                  </>
                ) : (
                  "Agregar Producto"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductos;
