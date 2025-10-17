export interface IconSetPayload {
  objectId: string;
}

export const createSetIconPayload = (objectId: string): IconSetPayload => ({
  objectId,
});