import supabase from '../config/supabase.config';
import { v4 as uuidv4 } from 'uuid';

export async function subirImagen(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  const fileId = uuidv4();

  const extMatch = file.name.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
  const ext = extMatch ? `.${extMatch[1]}` : '';

  const fileName = `${fileId}${ext}`;
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

    return fileId;
  } catch (err: any) {
    console.error('Error subiendo imagen a Supabase:', err);
    throw err;
  }
}

export async function deleteImagen(fileIdOrPath: string): Promise<void> {
  try {
    
    let pathCandidates: string[] = [];
    if (fileIdOrPath.includes('/')) {
      pathCandidates = [fileIdOrPath];
    } else if (fileIdOrPath.includes('.')) {
      pathCandidates = [`organigrama/${fileIdOrPath}`];
    } else {
      pathCandidates = [`organigrama/${fileIdOrPath}`];
    }

    for (const candidate of pathCandidates) {
      const { error } = await supabase.storage.from('media').remove([candidate]);
      if (!error) {
        return;
      }
    }

    console.warn('No se pudo borrar imagen en Supabase con los candidatos:', pathCandidates);
  } catch (err: any) {
    console.error('Error borrando imagen en Supabase:', err);
  }
}
