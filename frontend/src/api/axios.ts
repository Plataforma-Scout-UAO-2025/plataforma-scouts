import axios from "axios";

// Configuración unificada - compatible con ambas variables de entorno
const rawBaseUrl = import.meta.env.VITE_PUBLIC_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const baseURL = rawBaseUrl.endsWith('/api/v1') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`;

console.log('🔧 [Axios Config] Base URL configurada:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de request para logging (opcional)
api.interceptors.request.use(
  (config) => {
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

// Nota: Omitiendo configuración de autenticación por ahora, como solicitado.

export default api;