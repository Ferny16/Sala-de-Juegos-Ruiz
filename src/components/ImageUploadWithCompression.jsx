// src/components/ImageUploadWithCompression.jsx
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import imageCompression from "browser-image-compression";

/**
 * Componente de input de imagen con compresión automática
 *
 * @param {Function} onChange - Callback que recibe el archivo comprimido
 * @param {boolean} required - Si el campo es requerido
 * @param {boolean} disabled - Si el input está deshabilitado
 * @param {string} accept - Tipos de archivo aceptados
 * @param {Object} compressionOptions - Opciones de compresión personalizadas
 * @param {boolean} showPreview - Mostrar vista previa de la imagen
 * @param {string} className - Clases CSS adicionales
 * @param {Function} onError - Callback en caso de error
 *
 * @example
 * <ImageUploadWithCompression
 *   onChange={(file) => setForm({...form, imagen: file})}
 *   required
 * />
 */
const ImageUploadWithCompression = forwardRef(
  (
    {
      onChange,
      required = false,
      disabled = false,
      accept = "image/*",
      compressionOptions = {},
      showPreview = true,
      className = "",
      onError = null,
    },
    ref,
  ) => {
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressedFile, setCompressedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Opciones por defecto de compresión
    const defaultCompressionOptions = {
      maxSizeMB: 4.5, // permitimos hasta 4.5 MB
      maxWidthOrHeight: 1024, // rescalamos a 1024px máximo
      useWebWorker: true,
      fileType: "image/jpeg",
    };

    /**
     * Comprime una imagen
     */
    const compressImage = async (file) => {
      const options = { ...defaultCompressionOptions, ...compressionOptions };

      try {
        const originalSizeKB = (file.size / 1024).toFixed(2);
        console.log("📦 Imagen original:", originalSizeKB, "KB");

        const compressed = await imageCompression(file, options);

        const compressedSizeKB = (compressed.size / 1024).toFixed(2);
        const reduction = ((1 - compressed.size / file.size) * 100).toFixed(1);

        console.log("✅ Imagen comprimida:", compressedSizeKB, "KB");
        console.log("📉 Reducción:", reduction + "%");

        return compressed;
      } catch (error) {
        console.error("❌ Error comprimiendo imagen:", error);
        console.warn("⚠️ Usando imagen original sin comprimir");
        return file;
      }
    };

    /**
     * Maneja el cambio de archivo
     */
    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsCompressing(true);

      // Liberar preview anterior si existe
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      try {
        // Comprimir imagen
        const compressed = await compressImage(file);
        setCompressedFile(compressed);

        // Crear preview si está habilitado
        if (showPreview) {
          const previewURL = URL.createObjectURL(compressed);
          setPreview(previewURL);
        }

        // Notificar al componente padre
        if (onChange) {
          onChange(compressed);
        }
      } catch (error) {
        console.error("Error procesando imagen:", error);
        if (onError) {
          onError(error);
        }
      } finally {
        setIsCompressing(false);
      }
    };

    /**
     * Resetea el componente
     */
    const reset = () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      setCompressedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // Exponer método reset al componente padre
    useImperativeHandle(ref, () => ({
      reset,
    }));

    return (
      <div className={className}>
        <input
          type="file"
          accept={accept}
          className="form-control"
          onChange={handleFileChange}
          required={required}
          disabled={disabled || isCompressing}
          ref={fileInputRef}
        />

        {/* Indicador de compresión */}
        {isCompressing && (
          <small className="text-primary d-block mt-2">
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            🔄 Comprimiendo imagen...
          </small>
        )}

        {/* Confirmación de imagen lista */}
        {compressedFile && !isCompressing && (
          <small className="text-success d-block mt-2">
            ✅ Imagen lista ({(compressedFile.size / 1024).toFixed(2)} KB)
          </small>
        )}

        {/* Preview de la imagen */}
        {showPreview && preview && (
          <div className="mt-3">
            <img
              src={preview}
              alt="Vista previa"
              className="img-thumbnail"
              style={{
                maxWidth: "200px",
                maxHeight: "200px",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
    );
  },
);

ImageUploadWithCompression.displayName = "ImageUploadWithCompression";

export default ImageUploadWithCompression;
