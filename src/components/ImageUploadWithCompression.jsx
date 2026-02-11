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

  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }
  return `${kb.toFixed(2)} KB`;
};

/**
 * Componente de input de imagen con compresión automática
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
    const [compressionStage, setCompressionStage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);

    /**
     * Comprime una imagen de forma progresiva hasta que sea < 5 MB
     */
    const compressImageProgressively = async (file) => {
      try {
        console.log(
          "📦 Imagen original:",
          file.name,
          formatFileSize(file.size),
        );

        // Si la imagen ya es menor a 5MB, no comprimir (solo validar)
        if (file.size <= 5 * 1024 * 1024) {
          console.log("✅ Imagen ya es menor a 5MB, sin compresión necesaria");
          return file;
        }

        // Configuración inicial
        let currentFile = file;
        let attempt = 1;
        const maxAttempts = 5; // Aumentado a 5 intentos

        // Niveles de compresión progresivos más agresivos
        const compressionLevels = [
          {
            maxSizeMB: 4.5,
            maxWidthOrHeight: 1920,
            quality: 0.85,
            name: "Comprimiendo imagen... (paso 1/5)",
          },
          {
            maxSizeMB: 3.5,
            maxWidthOrHeight: 1600,
            quality: 0.75,
            name: "Optimizando imagen... (paso 2/5)",
          },
          {
            maxSizeMB: 2.5,
            maxWidthOrHeight: 1400,
            quality: 0.65,
            name: "Reduciendo tamaño... (paso 3/5)",
          },
          {
            maxSizeMB: 1.5,
            maxWidthOrHeight: 1200,
            quality: 0.55,
            name: "Compresión avanzada... (paso 4/5)",
          },
          {
            maxSizeMB: 1,
            maxWidthOrHeight: 1000,
            quality: 0.45,
            name: "Compresión máxima... (paso 5/5)",
          },
        ];

        while (attempt <= maxAttempts) {
          const level = compressionLevels[attempt - 1];
          setCompressionStage(level.name);

          console.log(`🔄 Intento ${attempt}/${maxAttempts}:`, level.name);

          const options = {
            maxSizeMB: level.maxSizeMB,
            maxWidthOrHeight: level.maxWidthOrHeight,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: level.quality,
            alwaysKeepResolution: false, // Permite reducir resolución
            ...compressionOptions,
          };

          const compressed = await imageCompression(currentFile, options);
          console.log(
            `✅ Resultado intento ${attempt}:`,
            formatFileSize(compressed.size),
          );

          // Si ya es menor a 5 MB, retornar
          if (compressed.size <= 5 * 1024 * 1024) {
            const reduction = ((1 - compressed.size / file.size) * 100).toFixed(
              1,
            );
            console.log(`✅ Compresión exitosa! Reducción: ${reduction}%`);
            return compressed;
          }

          // Si aún es grande, usar el comprimido como base para el siguiente intento
          currentFile = compressed;
          attempt++;
        }

        // Si después de todos los intentos sigue siendo > 5 MB, lanzar error específico
        const finalSize = formatFileSize(currentFile.size);
        console.error(
          `⚠️ Imagen demasiado grande después de ${maxAttempts} intentos:`,
          finalSize
        );
        
        throw new Error(
          `IMAGE_TOO_LARGE:${finalSize}`
        );
      } catch (error) {
        console.error("❌ Error en compresión:", error);
        
        // Si es nuestro error personalizado, propagarlo
        if (error.message.startsWith('IMAGE_TOO_LARGE:')) {
          throw error;
        }
        
        // Error genérico de compresión
        throw new Error(`Error al comprimir la imagen: ${error.message || 'Desconocido'}`);
      }
    };

    /**
     * Maneja el cambio de archivo
     */
    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      console.log("\n" + "=".repeat(50));
      console.log("🎯 NUEVO ARCHIVO SELECCIONADO");
      console.log("=".repeat(50));

      setIsCompressing(true);
      setCompressionStage("Iniciando...");
      setErrorMessage(""); // Limpiar errores previos

      // Liberar preview anterior
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      // Resetear estados
      setCompressedFile(null);
      setPreview(null);
      setOriginalSize(null);

      try {
        // Validar formato
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ];
        
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `Formato no válido. Solo se permiten archivos JPG, PNG o WebP. Tu archivo es: ${file.type || "desconocido"}`
          );
        }

        // Guardar tamaño original
        setOriginalSize(file.size);
        const originalSizeFormatted = formatFileSize(file.size);

        console.log("📊 Tamaño original:", originalSizeFormatted);

        // Mostrar mensaje si la imagen es muy grande desde el inicio
        if (file.size > 10 * 1024 * 1024) {
          console.warn("⚠️ Imagen muy grande (>10MB), la compresión puede tardar...");
        }

        // Comprimir
        const compressed = await compressImageProgressively(file);

        const finalSizeFormatted = formatFileSize(compressed.size);
        console.log("📊 RESULTADO FINAL:");
        console.log("   Original:", originalSizeFormatted);
        console.log("   Comprimida:", finalSizeFormatted);
        console.log(
          "   Reducción:",
          ((1 - compressed.size / file.size) * 100).toFixed(1) + "%",
        );

        setCompressedFile(compressed);

        // Crear preview
        if (showPreview) {
          const previewURL = URL.createObjectURL(compressed);
          setPreview(previewURL);
        }

        // Notificar al padre
        if (onChange) {
          onChange(compressed);
        }

        setCompressionStage("¡Listo!");
        console.log("=".repeat(50) + "\n");
      } catch (error) {
        console.error("❌ ERROR COMPLETO:", error);
        console.log("=".repeat(50) + "\n");

        // Limpiar todo
        setCompressedFile(null);
        setPreview(null);
        setOriginalSize(null);
        setCompressionStage("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Manejar error de imagen muy grande
        if (error.message.startsWith('IMAGE_TOO_LARGE:')) {
          const finalSize = error.message.split(':')[1];
          const errorMsg = `❌ La imagen es demasiado grande (${finalSize}) incluso después de comprimirla.\n\n` +
            `📱 Para usar esta imagen:\n` +
            `1. Instala una app de compresión como "Compress Image" o "Photo Compress"\n` +
            `2. Reduce el tamaño de la imagen a menos de 5 MB\n` +
            `3. Vuelve a intentar subirla\n\n` +
            `💡 Tip: También puedes tomar una nueva foto con menor calidad en la configuración de tu cámara.`;
          
          setErrorMessage(errorMsg);
          
          if (onError) {
            onError(new Error(errorMsg));
          } else {
            alert(errorMsg);
          }
        } else {
          // Error genérico
          const errorMsg = error.message || "Error desconocido al procesar la imagen";
          setErrorMessage(`❌ ${errorMsg}`);
          
          if (onError) {
            onError(error);
          } else {
            alert(errorMsg);
          }
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
      setCompressionStage("");
      setErrorMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // Exponer método reset
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
            🔄 {compressionStage}
          </small>
        )}

        {/* Mensaje de error */}
        {errorMessage && !isCompressing && (
          <div className="alert alert-danger mt-2" role="alert" style={{ whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
            {errorMessage}
          </div>
        )}

        {/* Confirmación con tamaños */}
        {compressedFile && !isCompressing && originalSize && !errorMessage && (
          <small className="text-success d-block mt-2">
            ✅ Imagen lista: {formatFileSize(compressedFile.size)}
            {originalSize !== compressedFile.size && (
              <span className="text-muted">
                {" "}
                (original: {formatFileSize(originalSize)}, reducción:{" "}
                {((1 - compressedFile.size / originalSize) * 100).toFixed(0)}%)
              </span>
            )}
          </small>
        )}

        {/* Preview */}
        {showPreview && preview && !errorMessage && (
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