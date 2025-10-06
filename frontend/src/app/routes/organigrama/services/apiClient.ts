<<<<<<< HEAD
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}
=======
import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

// Normalizar base URL y asegurar que use la versión v1 del API.
// Si VITE_API_BASE_URL está definida, la usamos; si no, usamos localhost.
// Eliminamos cualquier slash final y añadimos '/api/v1' para apuntar a la nueva ruta.
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// Mantener la base host-only. Normalizaremos '/api/v1' en los endpoints para evitar duplicados
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, '');

// Normaliza el endpoint para que apunte a /api/v1 sin duplicados.
const normalizeEndpoint = (endpoint: string) => {
  if (!endpoint) return '/api/v1';
  // Asegurar prefijo '/'
  let e = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  if (e.startsWith('/api/v1')) return e; // ya correcto
  if (e.startsWith('/api')) return e.replace(/^\/api/, '/api/v1');
  // No empieza por /api -> añadir /api/v1 delante
  return '/api/v1' + e;
};
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f

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

<<<<<<< HEAD
const getDefaultHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const apiClient = {
  async request<T>(endpoint: string, config: ApiRequestConfig = { method: 'GET' }): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...getDefaultHeaders(), ...config.headers };
    const maxRetries = 2; // número total de intentos (1 + reintentos)
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt += 1;
        console.log(`🔄 [ApiClient] ${config.method} ${endpoint} (attempt ${attempt})`, config.body || '');
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
      } catch (error: unknown) {
        // Si es un ApiError (código HTTP no OK), no reintentamos
        if (error instanceof ApiError) {
          console.error(`❌ [ApiClient] ${config.method} ${endpoint} - Error API:`, error);
          throw error;
        }

        // Error de red / timeout: si quedan reintentos, esperar y reintentar
        console.error(`❌ [ApiClient] ${config.method} ${endpoint} - Error de red (attempt ${attempt}):`, error?.message || error);
        if (attempt >= maxRetries) {
          throw new Error(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }

        // Backoff simple antes de reintentar
        const backoffMs = 500 * attempt;
        await new Promise(r => setTimeout(r, backoffMs));
        // loop continuará y reintentará
      }
    }

    // debería ser inalcanzable
    throw new Error('Error inesperado en ApiClient.request');
  },

  get<T>(endpoint: string): Promise<T> { return this.request<T>(endpoint, { method: 'GET' }); },
  post<T>(endpoint: string, body: unknown): Promise<T> { return this.request<T>(endpoint, { method: 'POST', body }); },
  put<T>(endpoint: string, body: unknown): Promise<T> { return this.request<T>(endpoint, { method: 'PUT', body }); },
  delete<T>(endpoint: string): Promise<T> { return this.request<T>(endpoint, { method: 'DELETE' }); },
  patch<T>(endpoint: string, body: unknown): Promise<T> { return this.request<T>(endpoint, { method: 'PATCH', body }); },

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
=======
// Crear instancia de Axios con configuración base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor de respuesta para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [ApiClient] ${response.config.method?.toUpperCase()} ${response.config.url} - Éxito`, response.data);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status || 0;
    const statusText = error.response?.statusText || 'Network Error';
    const message = `Error ${status}: ${statusText}`;
    
    console.error(`❌ [ApiClient] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`, {
      status,
      statusText,
      message: error.message,
      data: error.response?.data
    });
    
    // Transformar AxiosError a nuestro ApiError personalizado
    throw new ApiError(status, statusText, message);
  }
);

// Interceptor de request para logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🔄 [ApiClient] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ [ApiClient] Error en request:', error);
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Métodos HTTP simplificados usando Axios
  async get<T>(endpoint: string): Promise<T> {
    const normalized = normalizeEndpoint(endpoint);
    console.log(`[ApiClient] GET full-url: ${API_BASE_URL}${normalized}`);
    const response = await axiosInstance.get<T>(normalized);
    return response.data;
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const normalized = normalizeEndpoint(endpoint);
    console.log(`[ApiClient] POST full-url: ${API_BASE_URL}${normalized}`);
    const response = await axiosInstance.post<T>(normalized, data);
    return response.data;
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const normalized = normalizeEndpoint(endpoint);
    console.log(`[ApiClient] PUT full-url: ${API_BASE_URL}${normalized}`);
    const response = await axiosInstance.put<T>(normalized, data);
    return response.data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const normalized = normalizeEndpoint(endpoint);
    console.log(`[ApiClient] DELETE full-url: ${API_BASE_URL}${normalized}`);
    const response = await axiosInstance.delete<T>(normalized);
    return response.data;
  },

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    const normalized = normalizeEndpoint(endpoint);
    console.log(`[ApiClient] PATCH full-url: ${API_BASE_URL}${normalized}`);
    const response = await axiosInstance.patch<T>(normalized, data);
    return response.data;
  },

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const normalized = normalizeEndpoint(endpoint);
      console.log(`🔄 [ApiClient] POST (FormData) full-url: ${API_BASE_URL}${normalized}`);
      
      const response = await axiosInstance.post<T>(normalized, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 segundos para uploads
      });
      
      console.log(`✅ [ApiClient] POST (FormData) ${endpoint} - Éxito`, response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status || 0;
        const statusText = error.response?.statusText || 'Upload Error';
        console.error(`❌ [ApiClient] POST (FormData) ${endpoint} - Error:`, error);
        throw new ApiError(status, statusText, `Error ${status}: ${statusText}`);
      }
      
      console.error(`❌ [ApiClient] POST (FormData) ${endpoint} - Error de red:`, error);
      throw new Error(`Error de conexión en upload: ${error instanceof Error ? error.message : 'Error desconocido'}`);
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    }
  }
};
