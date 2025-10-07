// Gallery operation types
export interface GalleryReplaceOperation {
  op: "replace";
  targetUuid: string;
  newValue: string;
}

export interface GalleryAddOperation {
  op: "add";
  newValue: string;
}

export interface GalleryRemoveOperation {
  op: "remove";
  targetUuid: string;
}

export interface GalleryUpdatePayload {
  operations: (GalleryReplaceOperation | GalleryAddOperation | GalleryRemoveOperation)[];
}
