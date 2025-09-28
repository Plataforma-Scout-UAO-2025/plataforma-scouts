import { API_CONFIG, getDefaultHeaders, buildApiUrl } from '../config/api.config';

// Tipo para los métodos HTTP
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// Tipo para las opciones de la petición
interface RequestOptions {
  method: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
}

// Error personalizado para API
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  
  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

// Función helper para realizar peticiones HTTP
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = { method: 'GET' }
): Promise<T> => {
  const url = buildApiUrl(endpoint);
  const headers = { ...getDefaultHeaders(), ...options.headers };
  
  try {
    const response = await fetch(url, {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT)
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        response.statusText,
        `Error ${response.status}: ${response.statusText}`
      );
    }

    // Si la respuesta está vacía (ej: DELETE), retornamos true
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return true as T;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Errores de red o timeout
    console.error('❌ [ApiClient] Error de red:', error);
    throw new Error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};