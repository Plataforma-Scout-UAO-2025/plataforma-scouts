import { uploadToStorage } from "@/api/upload";
import {
  setIcon as setIconApi,
  deleteIcon as deleteIconApi,
} from "@/api/organigramaApi";

export interface IconSetPayload {
  objectId: string;
}

export const createSetIconPayload = (objectId: string): IconSetPayload => ({
  objectId,
});

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
  formData.append("file", file);
  const uploadResponse = await uploadToStorage<{
    objectId: string;
    url: string;
  }>(formData, {
    onUploadProgress: onProgress,
  });
  await setIcon(tenantId, groupSlug, sectionId, uploadResponse.objectId);
  return uploadResponse.objectId;
};
