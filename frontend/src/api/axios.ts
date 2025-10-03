import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

let getAccessTokenSilently: (() => Promise<string>) | null = null;

export const setAuth0TokenProvider = (tokenProvider: () => Promise<string>) => {
  getAccessTokenSilently = tokenProvider;
};

api.interceptors.request.use(
  async (config) => {
    if (getAccessTokenSilently) {
        const token = await getAccessTokenSilently();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expirado o inválido. Auth0 manejará la re-autenticación.");
    }
    return Promise.reject(error);
  }
);

export default api;