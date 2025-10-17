import { uploadToStorage } from '@/api/upload';
import { getSection, setIcon as setIconApi, deleteIcon as deleteIconApi } from '@/api/organigramaApi';
import { createSetIconPayload } from '../utils/iconPayload';

const getRamaByIdDirect = async (tenantId: string, groupSlug: string, id: string) => {
  try {
    const data = await getSection(id, tenantId, groupSlug) as Record<string, unknown>;
    return data;
  } catch {
    return undefined;
  }
};

const extractUuidFromString = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const match = String(value).match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  return match ? match[0] : null;
};

export const getCurrentIconUuid = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string
): Promise<string | null> => {
  const rama = await getRamaByIdDirect(tenantId, groupSlug, sectionId);
  const maybe = rama as unknown as Record<string, unknown> | undefined;
  const iconUrl = maybe?.['iconUrl'] as string | undefined;
  return extractUuidFromString(iconUrl);
};

export const setIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  objectId: string
): Promise<void> => {
  const payload = createSetIconPayload(objectId);
  await setIconApi(sectionId, payload, tenantId, groupSlug);
};

export const deleteIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string
): Promise<void> => {
  await deleteIconApi(sectionId, tenantId, groupSlug);
};

export const updateIcon = async (
  tenantId: string,
  groupSlug: string,
  sectionId: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const uploadResponse = await uploadToStorage<{ objectId: string; url: string }>(formData, {
    onUploadProgress: onProgress,
  });
  await setIcon(tenantId, groupSlug, sectionId, uploadResponse.objectId);
  return uploadResponse.objectId;
};