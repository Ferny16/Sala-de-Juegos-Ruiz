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
    }, 8000);
  };

  /**
   * Maneja los cambios en los inputs del formulario
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  /**
   * Maneja la imagen comprimida que viene del componente
   */
  const handleImageChange = (compressedFile) => {
    console.log("📷 Imagen recibida:", {
      name: compressedFile.name,
      size: `${(compressedFile.size / 1024).toFixed(2)} KB (${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB)`,
      type: compressedFile.type,
    });
    setForm((prev) => ({
      ...prev,
      imagen: compressedFile,
    }));
  };

  /**
   * Maneja errores al procesar la imagen
   */
  const handleImageError = (error) => {
    console.error("❌ Error procesando imagen:", error);
    // El componente ya muestra el error, solo lo logueamos aquí
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
      if (error.code === "ECONNABORTED") {
        return (
          "⏱️ La petición tardó demasiado tiempo.\n\n" +
          "Esto puede deberse a:\n" +
          "• Imagen muy pesada (intenta con una más pequeña)\n" +
          "• Conexión lenta (verifica tu internet)\n" +
          "• Servidor sobrecargado (intenta de nuevo en un momento)"
        );
      }
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        return (
          "🌐 Error de red al subir la imagen.\n\n" +
          "Posibles causas:\n" +
          "• El archivo es demasiado grande para tu conexión\n" +
          "• Timeout en la subida (intenta con imagen más pequeña)\n" +
          "• Problema temporal de conexión\n\n" +
          "💡 Solución: Comprime la imagen con una app antes de subirla"
        );
      }
      return (
        "❌ No se pudo completar la petición.\n\n" +
        "Intenta:\n" +
        "• Usar una imagen más pequeña\n" +
        "• Verificar tu conexión a internet\n" +
        "• Intentar nuevamente en un momento"
      );
    }

    const status = error.response.status;
    const errorData = error.response.data;

    // Errores específicos según código HTTP
    switch (status) {
      case 400:
        if (errorData?.error) {
          return `📝 Error de validación: ${errorData.error}`;
        }
        return "📝 Datos inválidos. Por favor, revisa que todos los campos estén correctamente llenados.";

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
        return (
          "📦 El archivo es demasiado grande para el servidor.\n\n" +
          "La imagen fue comprimida pero el servidor la rechazó.\n\n" +
          "📱 Soluciones:\n" +
          "1. Usa una app de compresión de imágenes\n" +
          "2. Toma una foto con menor calidad\n" +
          "3. Contacta al administrador para aumentar el límite"
        );

      case 415:
        return "🖼️ Formato de imagen no soportado. Usa JPG, PNG o WebP.";

      case 422:
        if (errorData?.errors) {
          const errorMessages = Object.values(errorData.errors)
            .flat()
            .join(", ");
          return `⚠️ Errores de validación: ${errorMessages}`;
        }
        return "⚠️ Los datos enviados no son válidos. Verifica todos los campos.";

      case 500:
        if (errorData?.error) {
          if (
            errorData.error.includes("cloudinary") ||
            errorData.error.includes("upload")
          ) {
            return (
              "☁️ Error al subir la imagen a Cloudinary.\n\n" +
              "Esto puede deberse a:\n" +
              "• Problemas temporales del servicio\n" +
              "• Límite de almacenamiento alcanzado\n" +
              "• Credenciales incorrectas\n\n" +
              "Contacta al administrador."
            );
          }
          if (
            errorData.error.includes("mongo") ||
            errorData.error.includes("database")
          ) {
            return "🗄️ Error al guardar en la base de datos. Contacta al administrador.";
          }
          return `🔧 Error del servidor: ${errorData.error}`;
        }
        return "🔧 Error interno del servidor. Por favor, contacta al administrador.";

      case 502:
      case 503:
      case 504:
        return "⚠️ El servidor está temporalmente no disponible.\n\nIntenta nuevamente en unos minutos.";

      default:
        if (errorData?.error) {
          return `❌ Error: ${errorData.error}`;
        }
        return `❌ Error inesperado (Código ${status}). Contacta al administrador si persiste.`;
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

    if (!form.cantidad || Number(form.cantidad) <= 0) {
      errors.push("La cantidad debe ser mayor a 0");
    }

    if (!form.precioCompra || Number(form.precioCompra) < 0) {
      errors.push("El precio de compra no puede ser negativo");
    }

    if (!form.precioVenta || Number(form.precioVenta) < 0) {
      errors.push("El precio de venta no puede ser negativo");
    }

    if (!form.fechaCompra) {
      errors.push("La fecha de compra es obligatoria");
    }

    // ✅ VALIDACIÓN DE IMAGEN CORREGIDA
    if (!form.imagen) {
      errors.push("Debes seleccionar una imagen");
    } else if (!(form.imagen instanceof File)) {
      errors.push("Error: la imagen no es válida. Selecciona nuevamente.");
    } else {
      // ✅ PERMITIR HASTA 5MB (5120 KB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (form.imagen.size > maxSize) {
        const currentSize = (form.imagen.size / (1024 * 1024)).toFixed(2);
        errors.push(
          `❌ La imagen es demasiado grande (${currentSize} MB).\n` +
            `El límite es 5 MB. Por favor, comprime la imagen o elige otra.`,
        );
      }
    }

    // ✅ ADVERTENCIA (no error) si precio venta < precio compra
    if (Number(form.precioVenta) < Number(form.precioCompra)) {
      console.warn("⚠️ Precio de venta menor al precio de compra");
    }

    return errors;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleAddProduct = async (e) => {
    e.preventDefault();

    // 🔥 VALIDACIÓN IMPORTANTE
    if (!(form.imagen instanceof File)) {
      showToast(
        "Error: la imagen no está lista. Intenta seleccionarla nuevamente.",
        "error",
      );
      return;
    }

    // Evita doble submit
    if (uploading) {
      console.warn("⚠️ Ya hay una carga en progreso");
      return;
    }

    // Validar formulario antes de enviar
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showToast(validationErrors.join("\n\n"), "error");
      console.warn("❌ Errores de validación:", validationErrors);
      return;
    }

    setUploading(true);

    try {
      // Obtener token de autenticación
      const token = localStorage.getItem("token");

      if (!token) {
        showToast(
          "🔒 Debes iniciar sesión para agregar productos. Serás redirigido al login...",
          "error",
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
          "error",
        );
        return;
      }

      // Crear FormData con todos los campos
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("cantidad", form.cantidad);
      formData.append("precioCompra", form.precioCompra);
      formData.append("precioVenta", form.precioVenta);
      formData.append("fechaCompra", form.fechaCompra);
      formData.append("seVende", form.seVende);
      formData.append("imagen", form.imagen);

      // Log de debugging
      console.log("📤 Enviando producto:", {
        url: `${apiUrl}/api/products`,
        nombre: form.nombre,
        cantidad: form.cantidad,
        precioCompra: form.precioCompra,
        precioVenta: form.precioVenta,
        fechaCompra: form.fechaCompra,
        seVende: form.seVende,
        imagenNombre: form.imagen?.name,
        imagenSize: form.imagen
          ? `${(form.imagen.size / 1024).toFixed(2)} KB (${(form.imagen.size / (1024 * 1024)).toFixed(2)} MB)`
          : "N/A",
        imagenType: form.imagen?.type,
        tokenPresente: !!token,
      });

      console.log("🌐 URL completa:", `${apiUrl}/api/products`);
      console.log("IMAGEN FINAL:", form.imagen);
      console.log("Es File:", form.imagen instanceof File);

      // Enviar petición al backend con timeout más largo
      const response = await axios.post(`${apiUrl}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 180000, // ⚠️ AUMENTADO A 3 MINUTOS
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          console.log(`⬆️ Progreso: ${percentCompleted}%`);
        },
      });

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

      // Opcional: redirigir a la lista de productos después de 2 segundos
      // setTimeout(() => navigate("/productos"), 2000);
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
      if (
        window.confirm(
          "¿Estás seguro de cancelar? Se perderá el progreso de la carga.",
        )
      ) {
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
              <small className="form-text text-muted d-block mt-1">
                📷 Formatos: JPG, PNG, WebP. Tamaño máximo: 5 MB
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
