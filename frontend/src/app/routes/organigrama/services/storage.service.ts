import supabase from '../config/supabase.config';
import { v4 as uuidv4 } from 'uuid';

export async function subirImagen(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  // Generar UUID v4 para el archivo
  const fileId = uuidv4();

  // Extraer extensión
  const extMatch = file.name.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
  const ext = extMatch ? `.${extMatch[1]}` : '';

  const fileName = `${fileId}${ext}`; // ej: uuid.jpg
  const filePath = `organigrama/${fileName}`;

  try {
    const { error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // No retornamos la URL pública, sino el UUID (fileId) para que el backend lo registre
    return fileId;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Error subiendo imagen a Supabase:', err);
    throw err;
  }
}

export async function deleteImagen(fileIdOrPath: string): Promise<void> {
  // fileIdOrPath puede ser 'organigrama/uuid.jpg' o solo 'uuid.jpg' o 'uuid'
  try {
    // Si solo viene el uuid sin carpeta/extensión, intentar borrar todos los prefijos comunes
    let pathCandidates: string[] = [];
    if (fileIdOrPath.includes('/')) {
      pathCandidates = [fileIdOrPath];
    } else if (fileIdOrPath.includes('.')) {
      // Si ya incluye extensión
      pathCandidates = [`organigrama/${fileIdOrPath}`];
    } else {
      // solo uuid -> intentar con y sin extensión desconocida
      pathCandidates = [`organigrama/${fileIdOrPath}`];
    }

    for (const candidate of pathCandidates) {
      const { error } = await supabase.storage.from('media').remove([candidate]);
      if (!error) {
        // eliminado con éxito
        return;
      }
      // si hay error, seguir intentando con siguientes candidatos
    }

    // Si llegamos aquí, no fue posible borrar (no crítico en cliente)
    console.warn('No se pudo borrar imagen en Supabase con los candidatos:', pathCandidates);
  } catch (err: any) {
    console.error('Error borrando imagen en Supabase:', err);
    // no propagamos, solo logueamos
  }
}
