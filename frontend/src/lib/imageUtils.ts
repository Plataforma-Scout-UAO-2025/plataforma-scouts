import { uploadToStorage } from '@/api/upload';

export const fixSupabaseUrl = (url: string): string => {
  // Si la URL incluye 'storage/v1/object/images/' pero no '/public/', insertar '/public/'
  if (url.includes('storage/v1/object/images/') && !url.includes('/public/')) {
    return url.replace('storage/v1/object/images/', 'storage/v1/object/public/images/');
  }
  return url;
};

export const uploadPhotoFile = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
    onUploadProgress: onProgress ? (percent: number) => {
      onProgress(percent);
    } : undefined,
  });
  return uploadResponse.objectId;
};