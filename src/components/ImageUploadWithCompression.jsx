// src/components/ImageUploadWithCompression.jsx
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import imageCompression from "browser-image-compression";

/**
 * Formatea bytes a una unidad legible (KB, MB)
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const mb = bytes / (k * k);
  const kb = bytes / k;
  
  // Si es mayor a 1 MB, mostrar en MB
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  // Si es menor a 1 MB, mostrar en KB
  return `${kb.toFixed(2)} KB`;
};

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
 */
const ImageUploadWithCompression = forwardRef(
  (
    {
      onChange,
      required = false,
      disabled = false,
      accept = "image/jpeg,image/jpg,image/png,image/webp",
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
    const [originalSize, setOriginalSize] = useState(null);
    const fileInputRef = useRef(null);

    // Opciones por defecto de compresión más agresivas
    const defaultCompressionOptions = {
      maxSizeMB: 0.8, // Reducido a 0.8 MB para asegurar que pase
      maxWidthOrHeight: 1024, // Máximo 1024px
      useWebWorker: true,
      fileType: "image/jpeg",
      initialQuality: 0.8, // Calidad inicial del 80%
    };

    /**
     * Valida el archivo antes de procesar
     */
    const validateFile = (file) => {
      const maxSize = 10 * 1024 * 1024; // 10 MB máximo sin comprimir
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `Formato no válido. Solo se permiten: JPG, PNG, WebP. Tu archivo es: ${file.type}`
        );
      }

      if (file.size > maxSize) {
        throw new Error(
          `Imagen demasiado grande (${formatFileSize(file.size)}). El máximo permitido es 10 MB.`
        );
      }

      return true;
    };

    /**
     * Comprime una imagen con manejo de errores mejorado
     */
    const compressImage = async (file) => {
      const options = { ...defaultCompressionOptions, ...compressionOptions };

      try {
        console.log("📦 Imagen original:", formatFileSize(file.size));

        const compressed = await imageCompression(file, options);

        console.log("✅ Imagen comprimida:", formatFileSize(compressed.size));
        
        const reduction = ((1 - compressed.size / file.size) * 100).toFixed(1);
        console.log("📉 Reducción:", reduction + "%");

        // Verificar que la imagen comprimida no sea mayor a 1 MB
        if (compressed.size > 1024 * 1024) {
          console.warn("⚠️ Imagen comprimida aún es grande, aplicando compresión adicional...");
          
          // Segunda compresión más agresiva si es necesario
          const secondCompression = await imageCompression(compressed, {
            ...options,
            maxSizeMB: 0.5,
            initialQuality: 0.7,
          });
          
          console.log("✅ Segunda compresión:", formatFileSize(secondCompression.size));
          return secondCompression;
        }

        return compressed;
      } catch (error) {
        console.error("❌ Error comprimiendo imagen:", error);
        throw new Error(
          `No se pudo comprimir la imagen: ${error.message}. Intenta con una imagen más pequeña.`
        );
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
        // Validar archivo
        validateFile(file);
        setOriginalSize(file.size);

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
        
        // Limpiar estado
        setCompressedFile(null);
        setPreview(null);
        setOriginalSize(null);
        
        // Limpiar input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

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
      setOriginalSize(null);
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

        {/* Confirmación de imagen lista con tamaños */}
        {compressedFile && !isCompressing && originalSize && (
          <small className="text-success d-block mt-2">
            ✅ Imagen lista: {formatFileSize(compressedFile.size)}
            {originalSize !== compressedFile.size && (
              <span className="text-muted">
                {" "}(original: {formatFileSize(originalSize)}, 
                reducción: {((1 - compressedFile.size / originalSize) * 100).toFixed(0)}%)
              </span>
            )}
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
