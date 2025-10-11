import type {
  GalleryAddOperation,
  GalleryReplaceOperation,
  GalleryRemoveOperation,
  GalleryUpdatePayload,
} from '../types/operations';

// Helpers para construir operaciones y payloads de galería
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

// Serializa el payload a snake_case para enviar al backend (ObjectMapper usa SNAKE_CASE)

const opToSnake = (op: GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation) => {
  // Map fields camelCase -> snake_case (newValue -> new_value, targetUuid -> target_uuid)
  const base: Record<string, unknown> = { op: op.op };
  // Preserve explicit targetUuid even if null (backend may expect key with null)
  if ('targetUuid' in op) base['target_uuid'] = (op as any).targetUuid;
  if ('newValue' in op && (op as any).newValue !== undefined) base['new_value'] = (op as any).newValue;
  if ('value' in op && (op as any).value !== undefined) base['new_value'] = (op as any).value; // fallback if any
  return base;
};

export const createPayloadForBackend = (operations: (GalleryAddOperation | GalleryReplaceOperation | GalleryRemoveOperation)[]) => ({
  operations: operations.map(opToSnake),
});

export const createAddPayload = (newValue: string) => createPayload([createAddOp(newValue)]);

export const createReplacePayload = (targetUuid: string, newValue: string) => createPayload([createReplaceOp(targetUuid, newValue)]);

export const createRemovePayload = (targetUuid: string | null) => createPayload([createRemoveOp(targetUuid)]);

export const createAddsPayloadFromArray = (objectIds: string[]) => createPayload(objectIds.map((id) => createAddOp(id)));

// ===============================================================
// 🔄 Retry utilities para operaciones de galería (según instructions.md)
// ===============================================================

export interface RetryOptions {
  attempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Ejecuta una función con retry y backoff exponencial según las instrucciones
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    attempts = 3,
    baseDelay = 500,
    maxDelay = 2000,
    shouldRetry = (error) => {
      // No reintentar si la imagen ya no está en la galería (404)
      if (error?.response?.status === 404) {
        return false;
      }
      // Reintentar solo en errores temporales (429, 5xx)
      if (error?.response?.status) {
        const status = error.response.status;
        return status === 429 || (status >= 500 && status < 600);
      }
      return true; // Reintentar otros errores de red por defecto
    }
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // No reintentar si es el último intento o si no debemos reintentar este error
      if (attempt === attempts - 1 || !shouldRetry(error)) {
        throw error;
      }

      // Calcular delay con backoff exponencial
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      
      console.warn(`⚠️ [GalleryRetry] Attempt ${attempt + 1}/${attempts} failed, retrying in ${delay}ms:`, error);
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Wrapper específico para operaciones de galería con retry según las instrucciones
 */
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
      
      // No reintentar si la imagen ya no está en la galería (404)
      if (error?.response?.status === 404) {
        console.info(`ℹ️ [${operationName}] Not retrying 404 - resource may have been deleted by another operation`);
        return false;
      }
      
      // Reintentar solo en errores temporales
      if (error?.response?.status) {
        const status = error.response.status;
        const shouldRetryStatus = status === 429 || (status >= 500 && status < 600);
        console.info(`ℹ️ [${operationName}] Status ${status}, will retry: ${shouldRetryStatus}`);
        return shouldRetryStatus;
      }
      
      // Reintentar errores de red
      console.info(`ℹ️ [${operationName}] Network error, will retry`);
      return true;
    }
  });
}
