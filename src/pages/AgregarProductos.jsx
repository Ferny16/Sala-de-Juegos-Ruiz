import { useState, useRef } from "react";
import axios from "axios";
import "../styles/AgregarProductos.css";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    precioCompra: "",
    precioVenta: "",
    fechaCompra: "",
    imagen: null,
    seVende: true, // ✅ NUEVO CAMPO
  });
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState({ show: false, text: "", type: "" });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type: "" });
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target; // ✅ Agregado type y checked

    if (files && files[0]) {
      // Liberar preview anterior
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const imageURL = URL.createObjectURL(files[0]);

      setForm({ ...form, imagen: files[0] });
      setPreview(imageURL);
    } else if (type === "checkbox") {
      // ✅ NUEVO: Manejo de checkbox
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Evita doble submit
    if (uploading) return;

    setUploading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      // ✅ OBTENER TOKEN
      const token = localStorage.getItem("token"); // O sessionStorage.getItem('token')

      if (!token) {
        showToast("Debes iniciar sesión para agregar productos", "error");
        // Opcional: redirigir al login
        // navigate('/login');
        return;
      }

      // ✅ ENVIAR CON TOKEN EN HEADERS
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

      // Liberar preview ANTES de limpiar
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setForm({
        nombre: "",
        cantidad: "",
        precioCompra: "",
        precioVenta: "",
        fechaCompra: "",
        imagen: null,
        seVende: true, // ✅ Reset del campo
      });

      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);

      // ✅ MANEJO MEJORADO DE ERRORES
      if (error.response?.status === 401) {
        showToast(
          "Sesión expirada. Por favor inicia sesión nuevamente.",
          "error"
        );
        // Opcional: limpiar token y redirigir
        // localStorage.removeItem('token');
        // navigate('/login');
      } else if (error.response?.data?.error) {
        showToast(error.response.data.error, "error");
      } else {
        showToast("Error al agregar producto", "error");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Liberar preview si existe
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
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

      {/* Toast */}
      {toast.show && (
        <div className={`toast-custom ${toast.type}`}>{toast.text}</div>
      )}

      {/* Contenedor cuadrado centrado */}
      <div
        className="container-fluid d-flex justify-content-center align-items-center py-4"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div className="square-container position-relative p-4 bg-white rounded shadow">
          {/* Botón X para cerrar */}
          <button
            className="btn-close position-absolute"
            style={{ top: "15px", right: "15px" }}
            onClick={handleClose}
            aria-label="Volver al menú"
          ></button>

          <h2 className="text-center mb-4">Agregar Producto</h2>

          <div className="row align-items-start">
            {/* Preview desktop */}
            {preview && (
              <div className="col-md-3 d-none d-md-flex justify-content-center">
                <img
                  src={preview}
                  alt="Vista previa del producto"
                  className="img-preview"
                />
              </div>
            )}

            <form
              className="col-12 col-md-9 row g-3"
              onSubmit={handleAddProduct}
            >
              <div className="col-md-6">
                <label>Nombre</label>
                <input
                  name="nombre"
                  className="form-control"
                  value={form.nombre}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label>Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  className="form-control"
                  value={form.cantidad}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-3">
                <label>Fecha</label>
                <input
                  type="date"
                  name="fechaCompra"
                  className="form-control"
                  value={form.fechaCompra}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Precio Compra</label>
                <input
                  type="number"
                  name="precioCompra"
                  className="form-control"
                  value={form.precioCompra}
                  required
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label>Precio Venta</label>
                <input
                  type="number"
                  name="precioVenta"
                  className="form-control"
                  value={form.precioVenta}
                  required
                  onChange={handleChange}
                />
              </div>

              {/* ✅ NUEVO CAMPO: Disponible para Venta */}
              <div className="col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="seVende"
                    id="seVende"
                    className="form-check-input"
                    checked={form.seVende}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="seVende">
                    Disponible para venta
                  </label>
                </div>
              </div>

              {/* Archivo */}
              <div className="col-12">
                <label>Imagen</label>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  className="form-control"
                  onChange={handleChange}
                  required
                  disabled={uploading}
                  ref={fileInputRef}
                />
              </div>

              {/* Preview móvil */}
              {preview && (
                <div className="col-12 d-md-none">
                  <img
                    src={preview}
                    alt="Vista previa del producto"
                    className="img-preview"
                  />
                </div>
              )}

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={uploading}
                >
                  {uploading ? "Subiendo..." : "Agregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
