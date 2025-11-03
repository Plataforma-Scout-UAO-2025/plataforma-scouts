import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1",
});

let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setAuth0TokenProvider = (tokenProvider: () => Promise<string>) => {
  getAccessTokenSilently = tokenProvider;
};

api.interceptors.request.use(
  async (config) => {
    // Agregar token de autenticación si está disponible
    if (getAccessTokenSilently) {
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    // Establecer Content-Type solo si NO es FormData
    // (FormData necesita que el navegador establezca el boundary automáticamente)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  }
);

export default api;