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
    }, 6000);
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
    console.log("📷 Imagen recibida:", {
      name: compressedFile.name,
      size: `${(compressedFile.size / 1024).toFixed(2)} KB (${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB)`,
      type: compressedFile.type
    });
    setForm({ ...form, imagen: compressedFile });
  };

  /**
   * Maneja errores al procesar la imagen
   */
  const handleImageError = (error) => {
    console.error("Error procesando imagen:", error);
    showToast(
      error.message || "Error al procesar la imagen. Por favor, intenta con otra imagen.",
      "error"
    );
  };

  /**
   * Registra el error completo en consola para debugging
   */
  const logDetailedError = (error, context) => {
    console.group(`❌ Error en ${context}`);
    console.error("Mensaje:", error.message);
    console.error("Stack:", error.stack);
    
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Request enviado pero sin respuesta");
      console.error("Request:", error.request);
    } else {
      console.error("Error al configurar la petición");
    }
    
    console.error("Config:", error.config);
    console.groupEnd();
  };

  /**
   * Obtiene un mensaje de error amigable para el usuario
   */
  const getUserFriendlyErrorMessage = (error) => {
    // Error de red o servidor no responde
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return "⏱️ La petición tardó demasiado tiempo. Esto puede deberse a una imagen muy pesada o conexión lenta. Intenta con una imagen más pequeña.";
      }
      if (error.message === 'Network Error') {
        return "🌐 No hay conexión con el servidor. Verifica:\n• Tu conexión a internet\n• Que el servidor esté activo\n• Contacta al administrador si el problema persiste";
      }
      return "❌ No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.";
    }

    const status = error.response.status;
    const errorData = error.response.data;

    // Errores específicos según código HTTP
    switch (status) {
      case 400:
        if (errorData?.error) {
          return `📝 Error de validación: ${errorData.error}`;
        }
        return "📝 Datos inválidos. Por favor, revisa que todos los campos estén correctamente llenados y que la imagen sea válida.";

      case 401:
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/login");
        }, 3000);
        return "🔒 Tu sesión ha expirado. Serás redirigido al login en 3 segundos...";

      case 403:
        return "🚫 No tienes permisos para realizar esta acción. Contacta al administrador.";

      case 404:
        return "🔍 No se encontró el endpoint en el servidor. Verifica que la URL del API sea correcta o contacta al administrador.";

      case 413:
        return "📦 El archivo es demasiado grande para el servidor. Aunque la imagen fue comprimida, el servidor la rechazó. Intenta con una imagen más pequeña o contacta al administrador para aumentar el límite.";

      case 415:
        return "🖼️ Formato de imagen no soportado por el servidor. Asegúrate de usar JPG, PNG o WebP.";

      case 422:
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors).flat().join(", ");
          return `⚠️ Errores de validación: ${errorMessages}`;
        }
        return "⚠️ Los datos enviados no son válidos. Verifica todos los campos y la imagen.";

      case 500:
        if (errorData?.error) {
          if (errorData.error.includes('cloudinary') || errorData.error.includes('upload')) {
            return "☁️ Error al subir la imagen a Cloudinary. Esto puede deberse a:\n• Problemas con las credenciales de Cloudinary\n• Límite de almacenamiento alcanzado\n• Problema temporal del servicio\nContacta al administrador.";
          }
          if (errorData.error.includes('mongo') || errorData.error.includes('database')) {
            return "🗄️ Error al guardar en la base de datos. Contacta al administrador.";
          }
          return `🔧 Error del servidor: ${errorData.error}`;
        }
        return "🔧 Error interno del servidor. Por favor, contacta al administrador del sistema.";

      case 502:
      case 503:
      case 504:
        return "⚠️ El servidor está temporalmente no disponible. Esto puede deberse a:\n• Mantenimiento programado\n• Sobrecarga del servidor\n• Problemas de red\nIntenta nuevamente en unos minutos.";

      default:
        if (errorData?.error) {
          return `❌ Error: ${errorData.error}`;
        }
        return `❌ Error inesperado (Código ${status}). Por favor, contacta al administrador si el problema persiste.`;
    }
  };

  /**
   * Valida el formulario antes de enviar
   */
  const validateForm = () => {
    const errors = [];

    if (!form.nombre.trim()) {
      errors.push("El nombre es obligatorio");
    }

    if (!form.cantidad || form.cantidad <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }

    if (!form.precioCompra || form.precioCompra < 0) {
      errors.push("El precio de compra no puede ser negativo");
    }

    if (!form.precioVenta || form.precioVenta < 0) {
      errors.push("El precio de venta no puede ser negativo");
    }

    if (parseFloat(form.precioVenta) < parseFloat(form.precioCompra)) {
      errors.push("⚠️ Advertencia: El precio de venta es menor al precio de compra");
    }

    if (!form.fechaCompra) {
      errors.push("La fecha de compra es obligatoria");
    }

    if (!form.imagen) {
      errors.push("Debes seleccionar una imagen");
    }
    // ✅ YA NO VALIDAMOS EL TAMAÑO AQUÍ
    // La validación se hace en el componente ImageUploadWithCompression
    // que comprime primero y valida después

    return errors;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Evita doble submit
    if (uploading) {
      console.warn("Ya hay una carga en progreso");
      return;
    }

    // Validar formulario antes de enviar
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showToast(validationErrors.join(". "), "error");
      console.warn("Errores de validación:", validationErrors);
      return;
    }

    setUploading(true);

    try {
      // Crear FormData con todos los campos
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      // Log de debugging
      console.log("📤 Enviando producto:", {
        nombre: form.nombre,
        cantidad: form.cantidad,
        precioCompra: form.precioCompra,
        precioVenta: form.precioVenta,
        fechaCompra: form.fechaCompra,
        seVende: form.seVende,
        imagenNombre: form.imagen?.name,
        imagenSize: form.imagen ? `${(form.imagen.size / 1024).toFixed(2)} KB (${(form.imagen.size / (1024 * 1024)).toFixed(2)} MB)` : 'N/A',
        imagenType: form.imagen?.type
      });

      // Obtener token de autenticación
      const token = localStorage.getItem("token");

      if (!token) {
        showToast(
          "🔒 Debes iniciar sesión para agregar productos. Serás redirigido al login...",
          "error"
        );
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Verificar que el API_URL esté configurado
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        console.error("❌ REACT_APP_API_URL no está configurado en .env");
        showToast(
          "Error de configuración: URL del API no definida. Contacta al administrador.",
          "error"
        );
        return;
      }

      console.log("🌐 Enviando a:", `${apiUrl}/api/products`);

      // Enviar petición al backend
      const response = await axios.post(
        `${apiUrl}/api/products`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000, // 60 segundos de timeout (aumentado para imágenes grandes)
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`⬆️ Progreso de carga: ${percentCompleted}%`);
          },
        }
      );

      console.log("✅ Producto agregado exitosamente:", response.data);
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

      // Resetear componente de imagen
      imageUploadRef.current?.reset();

    } catch (error) {
      // Log detallado del error para debugging
      logDetailedError(error, "Agregar Producto");

      // Mostrar mensaje amigable al usuario
      const userMessage = getUserFriendlyErrorMessage(error);
      showToast(userMessage, "error");

    } finally {
      setUploading(false);
    }
  };

  /**
   * Cierra el formulario y vuelve al dashboard
   */
  const handleClose = () => {
    // Si está subiendo, pedir confirmación
    if (uploading) {
      if (window.confirm("¿Estás seguro de cancelar? Se perderá el progreso de la carga.")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <Navbar />

      {/* Toast de notificaciones */}
      {toast.show && (
        <div 
          className={`toast-custom ${toast.type}`}
          style={{ whiteSpace: 'pre-line' }}
        >
          {toast.text}
        </div>
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
                max={new Date().toISOString().split('T')[0]}
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

            {/* Imagen con compresión */}
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
              <small className="form-text text-muted">
                📷 Selecciona cualquier imagen - será comprimida automáticamente. 
                Formatos: JPG, PNG, WebP.
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
                    ></span>
                    Subiendo producto...
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
