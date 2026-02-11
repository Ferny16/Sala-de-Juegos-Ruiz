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
    const fileInputRef = useRef(null);

    /**
     * Comprime una imagen de forma progresiva hasta que sea < 1 MB
     */
    const compressImageProgressively = async (file) => {
      try {
        console.log(
          "📦 Imagen original:",
          file.name,
          formatFileSize(file.size),
        );

        // Configuración inicial
        let currentFile = file;
        let attempt = 1;
        const maxAttempts = 3;

        // Niveles de compresión progresivos
        const compressionLevels = [
          {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            quality: 0.8,
            name: "Comprimiendo imagen...",
          },
          {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1000,
            quality: 0.7,
            name: "Optimizando imagen...",
          },
          {
            maxSizeMB: 0.6,
            maxWidthOrHeight: 800,
            quality: 0.6,
            name: "Compresión máxima...",
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
            ...compressionOptions,
          };

          const compressed = await imageCompression(currentFile, options);
          console.log(
            `✅ Resultado intento ${attempt}:`,
            formatFileSize(compressed.size),
          );

          // Si ya es menor a 1 MB, retornar
          if (compressed.size <= 1024 * 1024) {
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

        // Si después de 3 intentos sigue siendo > 1 MB, retornar el último
        console.warn(
          "⚠️ Imagen aún grande después de 3 intentos, pero continuando...",
        );
        return currentFile;
      } catch (error) {
        console.error("❌ Error en compresión:", error);
        throw new Error(`Error al comprimir: ${error.message}`);
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
            `Formato no válido. Solo JPG, PNG, WebP. Tu archivo: ${file.type || "desconocido"}`,
          );
        }

        // Guardar tamaño original
        setOriginalSize(file.size);

        // Comprimir
        const compressed = await compressImageProgressively(file);

        console.log("📊 RESULTADO FINAL:");
        console.log("   Original:", formatFileSize(file.size));
        console.log("   Comprimida:", formatFileSize(compressed.size));
        console.log(
          "   Reducción:",
          ((1 - compressed.size / file.size) * 100).toFixed(1) + "%",
        );

        // Validar que no sea demasiado grande para el servidor
        if (compressed.size > 5 * 1024 * 1024) {
          throw new Error(
            `La imagen es muy grande incluso después de comprimir (${formatFileSize(compressed.size)}). ` +
              `Intenta con una imagen más pequeña o de menor resolución.`,
          );
        }

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

        if (onError) {
          onError(error);
        } else {
          alert(error.message);
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

        {/* Confirmación con tamaños */}
        {compressedFile && !isCompressing && originalSize && (
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
