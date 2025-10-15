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
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      console.log(` [ImageCompression] Imagen comprimida: ${file.size} → ${compressedDataUrl.length} bytes (${((1 - compressedDataUrl.length/file.size) * 100).toFixed(1)}% reducción)`);
      
      resolve(compressedDataUrl);
    };

    img.onerror = () => reject(new Error('Error cargando la imagen'));
    img.src = URL.createObjectURL(file);
  });
};


export const cleanupOldImages = (): void => {
  
  console.log(' [ImageCompression] Limpieza de imágenes deshabilitada en cliente; usar backend para gestión de objetos.');
};