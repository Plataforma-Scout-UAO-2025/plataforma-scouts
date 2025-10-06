/**
 * Utilidades simples para compresión de imágenes
 */

/**
 * Comprime una imagen reduciendo su calidad y dimensiones
 */
export const compressImage = (
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a data URL comprimido
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      console.log(`🗜️ [ImageCompression] Imagen comprimida: ${file.size} → ${compressedDataUrl.length} bytes (${((1 - compressedDataUrl.length/file.size) * 100).toFixed(1)}% reducción)`);
      
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Error cargando la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Limpia localStorage de imágenes antiguas si está lleno
 */
export const cleanupOldImages = (): void => {
  const imageKeys: string[] = [];
  
  // Recopilar todas las claves de imágenes
  for (let key in localStorage) {
    if (key.startsWith('organigrama_images_')) {
      imageKeys.push(key);
    }
  }

  // Si hay más de 20 imágenes, eliminar las más antiguas
  if (imageKeys.length > 20) {
    const keysToRemove = imageKeys.slice(0, imageKeys.length - 20);
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log(`🧹 [ImageCompression] ${keysToRemove.length} imágenes antiguas eliminadas`);
  }
};