import axios from "axios";
import type { AxiosInstance, AxiosProgressEvent, AxiosRequestConfig } from "axios";

interface PostFormDataOptions {
  config?: AxiosRequestConfig;
  onUploadProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

// Extender el tipo AxiosInstance para incluir postFormData
interface ExtendedAxiosInstance extends AxiosInstance {
  postFormData: <T = unknown>(url: string, formData: FormData, options?: PostFormDataOptions) => Promise<T>;
}

// Configuración unificada - compatible con diferentes variables de entorno
const normalizeUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const candidateBaseUrl =
  normalizeUrl(import.meta.env.VITE_BACKEND_URL ?? "") ||
  normalizeUrl(import.meta.env.VITE_PUBLIC_BACKEND_URL ?? "");

const fallbackBase = normalizeUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080");
const fallbackApiBase = fallbackBase.endsWith("api/v1/")
  ? fallbackBase
  : `${fallbackBase.replace(/\/$/, "")}/api/v1/`;

const baseURL = candidateBaseUrl || fallbackApiBase;

console.log('🔧 [Axios Config] Base URL configurada:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
}) as ExtendedAxiosInstance;

// Variable para el proveedor de tokens Auth0
let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setAuth0TokenProvider = (tokenProvider: () => Promise<string>) => {
  getAccessTokenSilently = tokenProvider;
};

// Interceptor de request para logging y autenticación
api.interceptors.request.use(
  async (config) => {
    // Agregar token de Auth0 si está disponible
    if (getAccessTokenSilently) {
      try {
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 [Auth] Token agregado a la petición:', token.substring(0, 20) + '...');
        } else {
          console.warn('⚠️ [Auth] No se obtuvo token');
        }
      } catch (error) {
        console.warn('⚠️ [Auth] No se pudo obtener token:', error);
      }
    } else {
      console.warn('⚠️ [Auth] Token provider no configurado');
    }
    
    console.log(`🔄 [API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [API] Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejo de errores
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] ${response.config.method?.toUpperCase()} ${response.config.url} - Éxito`);
    return response;
  },
  (error) => {
    const status = error.response?.status || 0;
    const statusText = error.response?.statusText || 'Network Error';
    
    console.error(`❌ [API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Error:`, {
      status,
      statusText,
      message: error.message,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Método personalizado para upload de archivos
api.postFormData = async function<T = unknown>(
  url: string,
  formData: FormData,
  options: PostFormDataOptions = {}
) {
  const { config, onUploadProgress, signal } = options;
  const forwardProgress = config?.onUploadProgress;

  const response = await this.post<T>(url, formData, {
    ...config,
    headers: {
      "Content-Type": "multipart/form-data",
      ...(config?.headers || {}),
    },
    signal: signal ?? config?.signal,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => {
      forwardProgress?.(progressEvent);
      if (onUploadProgress) {
        const total = progressEvent.total ?? 0;
        const percent = total > 0 ? Math.round((progressEvent.loaded * 100) / total) : 0;
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
};

export default api;