// src/pages/AgregarProductos.jsx
import { useState, useRef } from "react";
import axios from "axios";
import "../styles/AgregarProductos.css";
import { useNavigate } from "react-router-dom";
import ImageUploadWithCompression from "../components/ImageUploadWithCompression";
import Navbar from "../components/NavBar2";

const AgregarProductos = () => {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    cantidad: "",
    precioCompra: "",
    precioVenta: "",
    fechaCompra: "",
    imagen: null,       // { file, base64 }
    seVende: true,
  });
  const [toast, setToast] = useState({ show: false, text: "", type: "" });
  const imageUploadRef = useRef(null);
  const navigate = useNavigate();

  const showToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast({ show: false, text: "", type: "" }), 8000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /**
   * Recibe { file, base64 } del componente de imagen
   */
  const handleImageChange = ({ file, base64 }) => {
    console.log("📷 Imagen recibida:", {
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      type: file.type,
      base64Length: base64.length,
    });
    setForm((prev) => ({ ...prev, imagen: { file, base64 } }));
  };

  const handleImageError = (error) => {
    console.error("❌ Error procesando imagen:", error);
  };

  const validateForm = () => {
    const errors = [];

    if (!form.nombre.trim()) errors.push("El nombre es obligatorio.");
    if (!form.cantidad || Number(form.cantidad) <= 0) errors.push("La cantidad debe ser mayor a 0.");
    if (form.precioCompra === "" || Number(form.precioCompra) < 0) errors.push("El precio de compra no puede ser negativo.");
    if (form.precioVenta === "" || Number(form.precioVenta) < 0) errors.push("El precio de venta no puede ser negativo.");
    if (!form.fechaCompra) errors.push("La fecha de compra es obligatoria.");

    if (!form.imagen?.base64) {
      errors.push("Debes seleccionar una imagen.");
    } else if (form.imagen.file.size > 5 * 1024 * 1024) {
      const mb = (form.imagen.file.size / (1024 * 1024)).toFixed(2);
      errors.push(`La imagen es demasiado grande (${mb} MB). El límite es 5 MB.`);
    }

    if (Number(form.precioVenta) < Number(form.precioCompra)) {
      console.warn("⚠️ Precio de venta menor al precio de compra");
    }

    return errors;
  };

  const getUserFriendlyErrorMessage = (error) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "⏱️ La petición tardó demasiado. Verifica tu conexión e intenta con una imagen más pequeña.";
      }
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        return "🌐 Error de red. Verifica tu conexión a internet e intenta nuevamente.";
      }
      return "❌ No se pudo completar la petición. Verifica tu conexión e intenta nuevamente.";
    }

    const status = error.response.status;
    const errorData = error.response.data;

    switch (status) {
      case 400:
        return errorData?.error
          ? `📝 Error de validación: ${errorData.error}`
          : "📝 Datos inválidos. Por favor, revisa todos los campos.";
      case 401:
        setTimeout(() => { localStorage.removeItem("token"); navigate("/login"); }, 3000);
        return "🔒 Tu sesión ha expirado. Serás redirigido al login en 3 segundos...";
      case 403:
        return "🚫 No tienes permisos para realizar esta acción.";
      case 404:
        return "🔍 No se encontró el endpoint. Contacta al administrador.";
      case 413:
        return "📦 El archivo es demasiado grande para el servidor. Usa una imagen más pequeña o contacta al administrador.";
      case 415:
        return "🖼️ Formato de imagen no soportado. Usa JPG, PNG o WebP.";
      case 422:
        if (errorData?.errors) {
          return `⚠️ Errores de validación: ${Object.values(errorData.errors).flat().join(", ")}`;
        }
        return "⚠️ Los datos enviados no son válidos.";
      case 500:
        if (errorData?.error?.includes("cloudinary")) {
          return "☁️ Error al subir la imagen a Cloudinary. Contacta al administrador.";
        }
        if (errorData?.error?.includes("mongo") || errorData?.error?.includes("database")) {
          return "🗄️ Error al guardar en la base de datos. Contacta al administrador.";
        }
        return errorData?.error
          ? `🔧 Error del servidor: ${errorData.error}`
          : "🔧 Error interno del servidor. Por favor, contacta al administrador.";
      case 502:
      case 503:
      case 504:
        return "⚠️ El servidor está temporalmente no disponible. Intenta nuevamente en unos minutos.";
      default:
        return errorData?.error
          ? `❌ Error: ${errorData.error}`
          : `❌ Error inesperado (Código ${status}). Contacta al administrador.`;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (uploading) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showToast(validationErrors.join("\n"), "error");
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("🔒 Debes iniciar sesión. Serás redirigido al login...", "error");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        showToast("Error de configuración: URL del API no definida.", "error");
        return;
      }

      // ✅ ENVIAR COMO JSON con base64 — elimina problemas de multipart/FormData
      const payload = {
        nombre: form.nombre,
        cantidad: form.cantidad,
        precioCompra: form.precioCompra,
        precioVenta: form.precioVenta,
        fechaCompra: form.fechaCompra,
        seVende: form.seVende,
        imagenBase64: form.imagen.base64,          // data:image/jpeg;base64,...
        imagenNombre: form.imagen.file.name,
        imagenMimeType: form.imagen.file.type,
      };

      console.log("📤 Enviando producto:", {
        url: `${apiUrl}/api/products`,
        nombre: payload.nombre,
        cantidad: payload.cantidad,
        imagenNombre: payload.imagenNombre,
        imagenSize: `${(form.imagen.file.size / 1024).toFixed(2)} KB`,
        base64Length: payload.imagenBase64.length,
      });

      const response = await axios.post(`${apiUrl}/api/products`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 120000, // 2 minutos
      });

      console.log("✅ Producto agregado:", response.data);
      showToast("✅ Producto agregado correctamente");

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

      imageUploadRef.current?.reset();

    } catch (error) {
      console.error("❌ Error al agregar producto:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });
      showToast(getUserFriendlyErrorMessage(error), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) {
      if (window.confirm("¿Estás seguro de cancelar? Se perderá el progreso.")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      {toast.show && (
        <div
          className={`toast-custom ${toast.type}`}
          style={{
            whiteSpace: "pre-line",
            maxHeight: "80vh",
            overflowY: "auto",
            fontSize: "0.9rem",
            lineHeight: "1.6",
            padding: "16px",
          }}
        >
          {toast.text}
        </div>
      )}

      <div
        className="container-fluid d-flex justify-content-center align-items-center py-4"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        <div className="square-container position-relative p-4 bg-white rounded shadow">
          <button
            className="btn-close position-absolute"
            style={{ top: "15px", right: "15px" }}
            onClick={handleClose}
            aria-label="Volver al menú"
            disabled={uploading}
          />

          <h2 className="text-center mb-4">Agregar Producto</h2>

          <form className="row g-3" onSubmit={handleAddProduct}>
            {/* Nombre */}
            <div className="col-md-6">
              <label htmlFor="nombre" className="form-label">
                Nombre <span className="text-danger">*</span>
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
                placeholder="Ej: Coca Cola 600ml"
              />
            </div>

            {/* Cantidad */}
            <div className="col-md-3">
              <label htmlFor="cantidad" className="form-label">
                Cantidad <span className="text-danger">*</span>
              </label>
              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="1"
                className="form-control"
                value={form.cantidad}
                onChange={handleChange}
                required
                disabled={uploading}
                placeholder="1"
              />
            </div>

            {/* Fecha */}
            <div className="col-md-3">
              <label htmlFor="fechaCompra" className="form-label">
                Fecha <span className="text-danger">*</span>
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
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Precio Compra */}
            <div className="col-md-4">
              <label htmlFor="precioCompra" className="form-label">
                Precio Compra <span className="text-danger">*</span>
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
                placeholder="0.00"
              />
            </div>

            {/* Precio Venta */}
            <div className="col-md-4">
              <label htmlFor="precioVenta" className="form-label">
                Precio Venta <span className="text-danger">*</span>
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
                placeholder="0.00"
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

            {/* Imagen */}
            <div className="col-12">
              <label className="form-label">
                Imagen <span className="text-danger">*</span>
              </label>
              <ImageUploadWithCompression
                onChange={handleImageChange}
                onError={handleImageError}
                required
                disabled={uploading}
                showPreview={true}
                ref={imageUploadRef}
              />
              <small className="form-text text-muted d-block mt-1">
                📷 Formatos: JPG, PNG, WebP · Tamaño máximo: 5 MB
              </small>
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
                    />
                    Subiendo producto... (puede tardar un momento)
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
