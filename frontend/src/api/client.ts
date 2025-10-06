import axios, { AxiosError } from "axios";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor único para auth
const authInterceptor = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Interceptor único para errores
const errorInterceptor = (error: AxiosError) => {
  // Manejo centralizado de errores
  if (error.response?.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }
  return Promise.reject(error);
};

// Aplicar interceptores a ambos clientes
[apiClient].forEach((client) => {
  client.interceptors.request.use(authInterceptor);
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    errorInterceptor
  );
});

export default apiClient;
