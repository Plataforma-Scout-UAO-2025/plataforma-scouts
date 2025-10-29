import type {
  GalleryAddOperation,
  GalleryReplaceOperation,
  GalleryUpdatePayload,
} from '../types/operations';

export const createAddOp = (new_value: string) => ({ op: 'add' as const, new_value });

export const createReplaceOp = (target_uuid: string, new_value: string) => ({
  op: 'replace' as const,
  target_uuid,
  new_value,
});

export const createPayload = (operations: (GalleryAddOperation | GalleryReplaceOperation)[]): GalleryUpdatePayload => ({
  operations,
});


export const createPayloadForBackend = (operations: (GalleryAddOperation | GalleryReplaceOperation)[]) => createPayload(operations);

export const createAddPayload = (new_value: string) => createPayload([createAddOp(new_value)]);

export const createReplacePayload = (target_uuid: string, new_value: string) => createPayload([createReplaceOp(target_uuid, new_value)]);

export const createAddsPayloadFromArray = (new_values: string[]) => createPayload(new_values.map((value) => createAddOp(value)));