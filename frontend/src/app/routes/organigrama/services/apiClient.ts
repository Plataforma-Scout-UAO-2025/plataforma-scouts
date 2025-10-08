import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";

// Normalizar base URL y asegurar que use la versión v1 del API.
// Si VITE_API_BASE_URL está definida, la usamos; si no, usamos localhost.
// Eliminamos cualquier slash final y añadimos '/api/v1' para apuntar a la nueva ruta.
const RAW_API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
// Mantener la base host-only. Normalizaremos '/api/v1' en los endpoints para evitar duplicados
const API_BASE_URL = RAW_API_BASE.replace(/\/$/, "");

// Normaliza el endpoint para que apunte a /api/v1 sin duplicados.
const normalizeEndpoint = (endpoint: string) => {
  if (!endpoint) return "/api/v1";
  // Asegurar prefijo '/'
  let e = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  if (e.startsWith("/api/v1")) return e; // ya correcto
  if (e.startsWith("/api")) return e.replace(/^\/api/, "/api/v1");
  // No empieza por /api -> añadir /api/v1 delante
  return "/api/v1" + e;
};

export class ApiError extends Error {
  public status: number;
  public statusText: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
  }
}

// Crear instancia de Axios con configuración base
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de respuesta para manejo de errores
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `✅ [ApiClient] ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - Éxito`,
      response.data
    );
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status || 0;
    const statusText = error.response?.statusText || "Network Error";
    const message = `Error ${status}: ${statusText}`;

    console.error(
      `❌ [ApiClient] ${error.config?.method?.toUpperCase()} ${
        error.config?.url
      } - Error:`,
      {
        status,
        statusText,
        message: error.message,
        data: error.response?.data,
      }
    );

    // Transformar AxiosError a nuestro ApiError personalizado
    throw new ApiError(status, statusText, message);
  }
);

// Interceptor de request para logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(
      `🔄 [ApiClient] ${config.method?.toUpperCase()} ${config.url}`,
      config.data || ""
    );
    return config;
  },
  (error) => {
    console.error("❌ [ApiClient] Error en request:", error);
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
      console.log(
        `🔄 [ApiClient] POST (FormData) full-url: ${API_BASE_URL}${normalized}`
      );

      const response = await axiosInstance.post<T>(normalized, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 segundos para uploads
      });

      console.log(
        `✅ [ApiClient] POST (FormData) ${endpoint} - Éxito`,
        response.data
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status || 0;
        const statusText = error.response?.statusText || "Upload Error";
        console.error(
          `❌ [ApiClient] POST (FormData) ${endpoint} - Error:`,
          error
        );
        throw new ApiError(
          status,
          statusText,
          `Error ${status}: ${statusText}`
        );
      }

      console.error(
        `❌ [ApiClient] POST (FormData) ${endpoint} - Error de red:`,
        error
      );
      throw new Error(
        `Error de conexión en upload: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
    }
  },
};
