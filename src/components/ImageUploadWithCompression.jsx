// components/ImageUploadWithCompression.jsx - VERSIÓN SIMPLIFICADA
import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import imageCompression from "browser-image-compression";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const mb = bytes / (k * k);
  const kb = bytes / k;
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
};

const ImageUploadWithCompression = forwardRef(
  (
    {
      onChange,
      required = false,
      disabled = false,
      accept = "image/jpeg,image/jpg,image/png,image/webp",
      showPreview = true,
      onError = null,
    },
    ref,
  ) => {
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressedFile, setCompressedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [originalSize, setOriginalSize] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsCompressing(true);
      setErrorMessage("");

      if (preview) URL.revokeObjectURL(preview);
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
          throw new Error(`Formato no válido. Solo JPG, PNG o WebP.`);
        }

        setOriginalSize(file.size);
        console.log("📷 Imagen original:", formatFileSize(file.size));

        let finalFile = file;

        // ✅ SOLO comprimir si es mayor a 5MB
        if (file.size > 5 * 1024 * 1024) {
          console.log("🔄 Imagen >5MB, comprimiendo...");

          const options = {
            maxSizeMB: 4.5, // Dejamos margen
            maxWidthOrHeight: 1200,
            useWebWorker: true,
            fileType: "image/jpeg",
            initialQuality: 0.8,
          };

          finalFile = await imageCompression(file, options);
          console.log(
            "✅ Compresión completada:",
            formatFileSize(finalFile.size),
          );

          // ✅ VALIDACIÓN FINAL: Si sigue siendo >5MB, error
          if (finalFile.size > 5 * 1024 * 1024) {
            throw new Error(
              `IMAGE_TOO_LARGE:${formatFileSize(finalFile.size)}`,
            );
          }
        } else {
          console.log("✅ Imagen dentro del límite, sin compresión");
        }

        setCompressedFile(finalFile);

        if (showPreview) {
          setPreview(URL.createObjectURL(finalFile));
        }

        onChange(finalFile);
      } catch (error) {
        console.error("❌ Error:", error);

        if (error.message.includes("IMAGE_TOO_LARGE")) {
          const size = error.message.split(":")[1];
          setErrorMessage(
            `❌ La imagen sigue siendo demasiado grande (${size}).\n` +
              `Usa una imagen menor a 5MB o comprímela con una app.`,
          );
        } else {
          setErrorMessage(`❌ ${error.message}`);
        }

        if (onError) onError(error);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setIsCompressing(false);
      }
    };

    const reset = () => {
      if (preview) URL.revokeObjectURL(preview);
      setCompressedFile(null);
      setPreview(null);
      setOriginalSize(null);
      setErrorMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    useImperativeHandle(ref, () => ({ reset }));

    return (
      <div>
        <input
          type="file"
          accept={accept}
          className="form-control"
          onChange={handleFileChange}
          required={required}
          disabled={disabled || isCompressing}
          ref={fileInputRef}
        />

        {isCompressing && (
          <small className="text-primary d-block mt-2">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Comprimiendo imagen...
          </small>
        )}

        {errorMessage && !isCompressing && (
          <div
            className="alert alert-danger mt-2"
            style={{ whiteSpace: "pre-line" }}
          >
            {errorMessage}
          </div>
        )}

        {compressedFile && !isCompressing && originalSize && !errorMessage && (
          <small className="text-success d-block mt-2">
            ✅ {formatFileSize(compressedFile.size)}
            {originalSize !== compressedFile.size && (
              <span className="text-muted">
                {" "}
                (original: {formatFileSize(originalSize)}, reducción:{" "}
                {((1 - compressedFile.size / originalSize) * 100).toFixed(0)}%)
              </span>
            )}
          </small>
        )}

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
