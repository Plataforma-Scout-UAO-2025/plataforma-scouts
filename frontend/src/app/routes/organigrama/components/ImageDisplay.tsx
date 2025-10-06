import React from "react";
import { useImageStorage } from "../hooks/useImageStorage";
import type { Rama } from "../types/rama.type";

interface ImageDisplayProps {
  rama: Rama;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ rama }) => {
  const { getImageUrl, getGalleryUrls } = useImageStorage();

  // Obtener URL del icono - priorizar iconoObjectId, luego icono directo
  const getIconUrl = (): string | null => {
    // Si hay iconoObjectId, usar el hook refactorizado
    if (rama.iconoObjectId) {
      return getImageUrl(rama.iconoObjectId);
    }

    // Si el icono es una URL de datos (data:image/...), usarla directamente
    if (rama.icono && rama.icono.startsWith("data:")) {
      return rama.icono;
    }

    // Si hay una URL normal en icono, usarla
    if (rama.icono) {
      return rama.icono;
    }

    return null;
  };

  const iconUrl = getIconUrl();

  // Obtener URLs de la galería
  const galleryUrls = getGalleryUrls(rama.sectionGalleryObjectIds || []);

  return (
    <div className="space-y-4">
      {/* Icono principal */}
      {iconUrl && (
        <div>
          <h3 className="text-sm font-medium mb-2">
            Icono de rama {rama.nombre}
          </h3>
          <img
            src={iconUrl}
            alt={`Icono de ${rama.nombre}`}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              console.error("❌ Error cargando imagen:", iconUrl);
              e.currentTarget.style.display = "none";
            }}
            onLoad={() => {
              console.log("✅ Imagen cargada correctamente:", rama.nombre);
            }}
          />
        </div>
      )}

      {/* Galería de imágenes */}
      {galleryUrls.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Galería</h3>
          <div className="grid grid-cols-3 gap-2">
            {galleryUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Galería ${rama.nombre} ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de debug cuando no hay imagen */}
      {!iconUrl && (
        <div className="text-sm text-muted-foreground p-4 border border-dashed border-gray-300 rounded-lg">
          <p>No hay imagen disponible para esta rama.</p>
          <p className="text-xs mt-1">
            iconoObjectId: {rama.iconoObjectId || "N/A"}
            <br />
            icono:{" "}
            {rama.icono
              ? rama.icono.length > 50
                ? rama.icono.substring(0, 50) + "..."
                : rama.icono
              : "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
