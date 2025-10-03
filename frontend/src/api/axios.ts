import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable para almacenar la función de obtener token de Auth0
let getAccessTokenSilently: (() => Promise<string>) | null = null;

// Función para configurar el token provider de Auth0
export const setAuth0TokenProvider = (tokenProvider: () => Promise<string>) => {
  getAccessTokenSilently = tokenProvider;
};

// Interceptor para requests → añade token de Auth0
api.interceptors.request.use(
  async (config) => {
    try {
      if (getAccessTokenSilently) {
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // Fallback: intentar obtener token del sessionStorage si Auth0 no está disponible
        const fallbackToken = sessionStorage.getItem("token");
        if (fallbackToken) {
          config.headers.Authorization = `Bearer ${fallbackToken}`;
        }
      }
    } catch (error) {
      console.error("Error al obtener el token de Auth0:", error);
      // En caso de error, intentar con sessionStorage como fallback
      const fallbackToken = sessionStorage.getItem("token");
      if (fallbackToken) {
        config.headers.Authorization = `Bearer ${fallbackToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para responses → manejar errores con Auth0
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar tokens del sessionStorage
      sessionStorage.removeItem("token");
      
      // Si estamos en una aplicación con Auth0, redirigir al login de Auth0
      // En lugar de redirigir a /login, permitir que Auth0 maneje la re-autenticación
      console.warn("Token expirado o inválido. Requiere re-autenticación.");
      
      // Si no estamos en una ruta protegida, redirigir al home
      if (!window.location.pathname.startsWith('/app')) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
