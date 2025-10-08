import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setAuth0TokenProvider = (tokenProvider: () => Promise<string>) => {
  getAccessTokenSilently = tokenProvider;
  console.log('🔐 [Axios] Auth0 token provider registrado');
};

api.interceptors.request.use(
  async (config) => {
    if (getAccessTokenSilently) {
      const token = await getAccessTokenSilently();
      if (token) {
        // Loguear de forma segura el estado del token (no imprimir el token completo)
        try {
          const visible = typeof token === 'string' ? `${token.slice(0, 8)}... (len ${token.length})` : 'unknown';
          console.log('🔐 [Axios] Adjuntando Authorization header:', visible);
        } catch {
          console.log('🔐 [Axios] Adjuntando Authorization header: (token present)');
        }
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

export default api;
