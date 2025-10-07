import axios, { AxiosError, type AxiosProgressEvent } from 'axios';
import type { AxiosInstance } from 'axios';

// Normalizar base URL y asegurar que use la versión v1 del API.
// Si VITE_API_BASE_URL está definida, la usamos; si no, usamos localhost.
// Eliminamos cualquier slash final y añadimos '/api/v1' para apuntar a la nueva ruta.
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
// En desarrollo, usar URLs absolutas para evitar problemas de CORS
const API_BASE_URL = import.meta.env.DEV ? RAW_API_BASE.replace(/\/$/, '') : '';

// Normaliza el endpoint para que apunte a /api/v1 sin duplicados.
const normalizeEndpoint = (endpoint: string) => {
  if (!endpoint) return '/api/v1';
  // Asegurar prefijo '/'
  const e = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
  if (e.startsWith('/api/v1')) return e; // ya correcto
  if (e.startsWith('/api')) return e.replace(/^\/api/, '/api/v1');
  // No empieza por /api -> añadir /api/v1 delante
  return '/api/v1' + e;
};

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

// Crear instancia de Axios con configuración base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Permitir envío de cookies por defecto (por si la API usa sesiones cookie)
axiosInstance.defaults.withCredentials = true;

// Interceptor de respuesta para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [ApiClient] ${response.config.method?.toUpperCase()} ${response.config.url} - Éxito`, response.data);
    return response;
  },
  (error: AxiosError) => {
    // Si la peticin fue cancelada por AbortController/Axios, lanzar un
    // error especfico que los handlers de subida (postFormData) esperan.
    const errAny = error as unknown as Record<string, unknown>;
    if (errAny?.['code'] === 'ERR_CANCELED' || errAny?.['message'] === 'canceled') {
      console.warn(`[33m [ApiClient] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Cancelado por el usuario`);
      throw new Error('UploadCanceled');
    }

    const status = error.response?.status || 0;
    const statusText = error.response?.statusText || 'Network Error';
    const message = `Error ${status}: ${statusText}`;

    console.error(`[31m [ApiClient] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`, {
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
    // No usar localStorage ni almacenar tokens en el navegador para los uploads.
    // La autenticación/autoría debe gestionarse por el backend (Supabase) y no
    // desde storage del cliente. Aquí sólo hacemos logging de la petición.
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

  async postFormData<T>(endpoint: string, formData: FormData, onUploadProgress?: (percent: number) => void, signal?: AbortSignal): Promise<T> {
    // Nota: añadimos un parámetro opcional onUploadProgress para permitir
    // seguimiento del progreso de subida desde los módulos que lo requieran.
    // Esta función mantiene compatibilidad hacia atrás: el tercer argumento
    // es opcional y la llamada existente sin él sigue funcionando.
  async function _doPost( onUploadProgressLocal?: (percent: number) => void, signalLocal?: AbortSignal ) {
      try {
        const normalized = normalizeEndpoint(endpoint);
        console.log(`🔄 [ApiClient] POST (FormData) full-url: ${API_BASE_URL}${normalized}`);

        const response = await axiosInstance.post<T>(normalized, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000, // 60 segundos para uploads (más tolerancia a backend lento)
          // Para evitar problemas con servidores que no esperan cookies/credenciales
          // en endpoints de upload, enviamos explícitamente sin credenciales.
          withCredentials: false,
          signal: signalLocal,
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const loaded = progressEvent?.loaded;
            const total = progressEvent?.total;
            if (onUploadProgressLocal && typeof loaded === 'number' && typeof total === 'number' && total > 0) {
              const percent = Math.round((loaded / total) * 100);
              try {
                onUploadProgressLocal(percent);
              } catch (err) {
                console.warn('[ApiClient] onUploadProgress callback error', err);
              }
            }
          }
        });

        console.log(`✅ [ApiClient] POST (FormData) ${endpoint} - Éxito`, response.data);
        return response.data;
      } catch (error) {
        // Detectar cancelación explícita del request (AbortController)
        const errAny = error as unknown as Record<string, unknown>;
        if (errAny?.['code'] === 'ERR_CANCELED' || errAny?.['message'] === 'canceled') {
          console.warn(`⚠️ [ApiClient] POST (FormData) ${endpoint} - Cancelado por el usuario`);
          throw new Error('UploadCanceled');
        }
        if (error instanceof AxiosError) {
          const status = error.response?.status || 0;
          const statusText = error.response?.statusText || 'Upload Error';
          console.error(`❌ [ApiClient] POST (FormData) ${endpoint} - Error:`, error, 'response.data=', error.response?.data, 'response.headers=', error.response?.headers);

          // Intentar fallback con fetch (sin credenciales) para comparar/resolver
          try {
            const fullUrl = API_BASE_URL + normalizeEndpoint(endpoint);
            console.log(`🧪 [ApiClient] Ejecutando intento FETCH fallback a ${fullUrl} (credentials: omit)`);
            const fetchResp = await fetch(fullUrl, {
              method: 'POST',
              body: formData as unknown as BodyInit,
              credentials: 'omit',
              signal: signalLocal as unknown as AbortSignal
            });
            const text = await fetchResp.text();
            console.log('🧪 [ApiClient] Resultado FETCH fallback:', { status: fetchResp.status, statusText: fetchResp.statusText, body: text, headers: Array.from(fetchResp.headers.entries()) });
            if (fetchResp.ok) {
              try {
                const json = JSON.parse(text);
                console.log('🧪 [ApiClient] FETCH fallback succeeded, returning parsed JSON');
                return json as T;
              } catch (parseErr) {
                console.warn('🧪 [ApiClient] FETCH fallback parse error:', parseErr);
                // Si no es JSON, fallamos y seguiremos lanzando el ApiError
              }
            }
          } catch (fetchErr) {
            console.warn('🧪 [ApiClient] Error en intento FETCH fallback:', fetchErr);
          }
          throw new ApiError(status, statusText, `Error ${status}: ${statusText}`);
        }

        console.error(`❌ [ApiClient] POST (FormData) ${endpoint} - Error de red:`, error);
        throw new Error(`Error de conexión en upload: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    // Ejecutar la subida pasando el callback opcional recibido y la señal
    return (await _doPost(onUploadProgress, signal)) as unknown as T;
  }
};
