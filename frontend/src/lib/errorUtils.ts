/**
 * Extrae de forma segura el código de estado HTTP de formas de error comunes sin usar `any`.
 * @param error - El objeto de error, típicamente de un bloque catch.
 * @returns El código de estado HTTP si está disponible, de lo contrario undefined.
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;

  // Verificar si el error tiene una propiedad 'response'
  const candidate = error as { response?: unknown };
  if (!candidate.response || typeof candidate.response !== 'object') return undefined;

  const resp = candidate.response as { status?: unknown };
  if (typeof resp.status === 'number') return resp.status;

  return undefined;
}
