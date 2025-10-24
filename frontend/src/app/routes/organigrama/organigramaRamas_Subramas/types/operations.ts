// Gallery operation types
export interface GalleryReplaceOperation {
  op: "replace";
  target_uuid: string;
  new_value: string;
}

export interface GalleryAddOperation {
  op: "add";
  new_value: string;
}

export interface GalleryUpdatePayload extends Record<string, unknown> {
  operations: (GalleryReplaceOperation | GalleryAddOperation)[];
}