export const fixSupabaseUrl = (url: string): string => {
  // Si la URL incluye 'storage/v1/object/images/' pero no '/public/', insertar '/public/'
  if (url.includes('storage/v1/object/images/') && !url.includes('/public/')) {
    return url.replace('storage/v1/object/images/', 'storage/v1/object/public/images/');
  }
  return url;
};