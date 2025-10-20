export interface PhotoPrincipalPayload {
  objectId: string;
}

export const createSetPhotoPrincipalPayload = (objectId: string): PhotoPrincipalPayload => ({
  objectId,
});