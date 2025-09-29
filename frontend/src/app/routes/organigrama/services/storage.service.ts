import supabase from '../config/supabase.config';

function generarNombreUnico(originalName: string) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const extMatch = originalName.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
  const ext = extMatch ? `.${extMatch[1]}` : '';
  return `${timestamp}-${random}${ext}`;
}

export async function subirImagen(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  const fileName = generarNombreUnico(file.name);
  const filePath = `organigrama/${fileName}`;

  try {
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data: publicData } = supabase.storage.from('media').getPublicUrl(data.path);
    return publicData.publicUrl;
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Error subiendo imagen a Supabase:', err);
    throw err;
  }
}
