const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
}

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

const getDefaultHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const apiClient = {
  async request<T>(endpoint: string, config: ApiRequestConfig = { method: 'GET' }): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...getDefaultHeaders(), ...config.headers };
    try {
      console.log(`🔄 [ApiClient] ${config.method} ${endpoint}`, config.body || '');
      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, `Error ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.log(`✅ [ApiClient] ${config.method} ${endpoint} - Respuesta vacía`);
        return {} as T;
      }

      const data = await response.json();
      console.log(`✅ [ApiClient] ${config.method} ${endpoint} - Éxito`, data);
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`❌ [ApiClient] ${config.method} ${endpoint} - Error API:`, error);
        throw error;
      }
      console.error(`❌ [ApiClient] ${config.method} ${endpoint} - Error de red:`, error);
      throw new Error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  get<T>(endpoint: string): Promise<T> { return this.request<T>(endpoint, { method: 'GET' }); },
  post<T>(endpoint: string, body: any): Promise<T> { return this.request<T>(endpoint, { method: 'POST', body }); },
  put<T>(endpoint: string, body: any): Promise<T> { return this.request<T>(endpoint, { method: 'PUT', body }); },
  delete<T>(endpoint: string): Promise<T> { return this.request<T>(endpoint, { method: 'DELETE' }); },
  patch<T>(endpoint: string, body: any): Promise<T> { return this.request<T>(endpoint, { method: 'PATCH' as any, body }); },

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    try {
      console.log(`🔄 [ApiClient] POST (FormData) ${endpoint}`);
      const response = await fetch(url, { method: 'POST', body: formData, signal: AbortSignal.timeout(30000) });
      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, `Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`✅ [ApiClient] POST (FormData) ${endpoint} - Éxito`, data);
      return data;
    } catch (error) {
      if (error instanceof ApiError) { console.error(`❌ [ApiClient] POST (FormData) ${endpoint} - Error API:`, error); throw error; }
      console.error(`❌ [ApiClient] POST (FormData) ${endpoint} - Error de red:`, error);
      throw new Error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
};
