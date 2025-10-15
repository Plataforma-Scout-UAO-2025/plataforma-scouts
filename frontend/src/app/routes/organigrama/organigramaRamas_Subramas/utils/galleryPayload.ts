import type {
  GalleryAddOperation,
  GalleryReplaceOperation,
  GalleryRemoveOperation,
  GalleryUpdatePayload,
} from '../types/operations';

export const createAddOp = (newValue: string): GalleryAddOperation => ({ op: 'add', newValue });

export const createReplaceOp = (targetUuid: string, newValue: string): GalleryReplaceOperation => ({
  op: 'replace',
  targetUuid,
  newValue,
});

export const createRemoveOp = (targetUuid: string | null): GalleryRemoveOperation => ({ op: 'remove', targetUuid });

export const createPayload = (operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[]): GalleryUpdatePayload => ({
  operations,
});


const opToSnake = (op: GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation) => {
  const base: Record<string, unknown> = { op: op.op };
  if ('targetUuid' in op) base['target_uuid'] = (op as unknown as { targetUuid?: unknown }).targetUuid;
  if ('newValue' in op && (op as unknown as { newValue?: unknown }).newValue !== undefined) base['new_value'] = (op as unknown as { newValue?: unknown }).newValue;
  if ('value' in op && (op as unknown as { value?: unknown }).value !== undefined) base['new_value'] = (op as unknown as { value?: unknown }).value; 
  return base;
};

export const createPayloadForBackend = (operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[]) => ({
  operations: operations.map(opToSnake),
});

export const createAddPayload = (newValue: string) => createPayload([createAddOp(newValue)]);

export const createReplacePayload = (targetUuid: string, newValue: string) => createPayload([createReplaceOp(targetUuid, newValue)]);

export const createRemovePayload = (targetUuid: string | null) => createPayload([createRemoveOp(targetUuid)]);

export const createAddsPayloadFromArray = (objectIds: string[]) => createPayload(objectIds.map((id) => createAddOp(id)));

//  Retry utilities para operaciones de galería (según instructions.md)

export interface RetryOptions {
  attempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const getHttpStatus = (error: unknown): number | undefined => {
  try {
    const maybe = error as { response?: { status?: number } };
    return typeof maybe?.response?.status === 'number' ? maybe.response.status : undefined;
  } catch {
    return undefined;
  }
};


export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    attempts = 3,
    baseDelay = 500,
    maxDelay = 2000,
    shouldRetry = (error) => {
      const status = getHttpStatus(error);
      if (status === 404) return false;
      if (typeof status === 'number') return status === 429 || (status >= 500 && status < 600);
      return true;
    }
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      
      if (attempt === attempts - 1 || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.warn(` [GalleryRetry] Attempt ${attempt + 1}/${attempts} failed, retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function retryGalleryOperation<T>(
  fn: () => Promise<T>,
  operationName: string = 'Gallery operation'
): Promise<T> {
  return retry(fn, {
    attempts: 3,
    baseDelay: 500,
    maxDelay: 2000,
    shouldRetry: (error) => {
      console.warn(`⚠️ [${operationName}] Operation failed:`, error);
      
      const status = getHttpStatus(error);
      if (status === 404) {
        console.info(` [${operationName}] Not retrying 404 - resource may have been deleted by another operation`);
        return false;
      }

      if (typeof status === 'number') {
        const shouldRetryStatus = status === 429 || (status >= 500 && status < 600);
        console.info(` [${operationName}] Status ${status}, will retry: ${shouldRetryStatus}`);
        return shouldRetryStatus;
      }

      console.info(` [${operationName}] Network error, will retry`);
      return true;
    }
  });
}