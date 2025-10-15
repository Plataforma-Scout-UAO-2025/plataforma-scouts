import React from 'react';
import { useImageStorage } from '../hooks/useImageStorage';
import type { Branch as Rama } from '../types/frontend';

interface ImageDisplayProps {
  rama: Rama;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ rama }) => {
  const { getImageUrl, getGalleryUrls } = useImageStorage();

  const getIconUrl = (): string | null => {
  const iconObjectId = rama.iconObjectId ?? rama.iconoObjectId;
  const iconUrlDirect = rama.iconUrl ?? rama.icono;

    if (iconObjectId) return getImageUrl(iconObjectId);
    if (typeof iconUrlDirect === 'string' && iconUrlDirect.startsWith('data:')) return iconUrlDirect;
    if (typeof iconUrlDirect === 'string') return iconUrlDirect;
    return null;
  };

  const iconUrl = getIconUrl();

  const galleryFromRama = (rama as unknown as Record<string, unknown>)['gallery'] as unknown[] | undefined;
  const galleryUrls: string[] = Array.isArray(galleryFromRama) && galleryFromRama.length > 0
    ? (galleryFromRama as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean)
    : getGalleryUrls((rama.galleryObjectIds && rama.galleryObjectIds.length > 0) ? rama.galleryObjectIds : (rama.sectionGalleryObjectIds || []));

  const displayName = rama.name ?? rama.nombre ?? 'Rama';

  return (
    <div className="space-y-4">
      {/* Icono principal */}
      {iconUrl && (
        <div>
          <h3 className="text-sm font-medium mb-2">Icono de rama {displayName}</h3>
          <img 
            src={iconUrl} 
            alt={`Icono de ${displayName}`}
            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            onError={(e) => {
              console.error(' Error cargando imagen:', iconUrl);
              e.currentTarget.style.display = 'none';
            }}
            onLoad={() => {
              console.log(' Imagen cargada correctamente:', displayName);
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
                alt={`Galería ${displayName} ${index + 1}`}
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
            iconObjectId: {(rama.iconObjectId ?? rama.iconoObjectId) || 'N/A'}<br/>
            iconUrl: {(() => {
              const url = rama.iconUrl ?? rama.icono;
              if (!url) return 'N/A';
              return url.length > 50 ? url.substring(0, 50) + '...' : url;
            })()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;