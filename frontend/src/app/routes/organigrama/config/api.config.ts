// Configuración base para las llamadas a la API del módulo organigrama
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    RAMAS: '/organigrama/sections',
    SUBRAMAS: '/organigrama/subgroups'
  },
  TIMEOUT: 10000 // 10 segundos
} as const;

// Headers comunes para las peticiones
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};