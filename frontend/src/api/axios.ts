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
        }
      } catch (error) {
        console.warn('⚠️ [Auth] No se pudo obtener token:', error);
      }
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

export default api;