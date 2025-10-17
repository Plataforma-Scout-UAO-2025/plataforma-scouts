export interface PhotoPrincipalPayload {
  objectId: string;
}

export const createSetPhotoPrincipalPayload = (objectId: string): PhotoPrincipalPayload => ({
  objectId,
});

export const createPayloadForBackend = (payload: PhotoPrincipalPayload) => ({
  object_id: payload.objectId,
});