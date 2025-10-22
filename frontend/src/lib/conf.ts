export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
export const ENDPOINTS = {
    acudiente: `${API_BASE}/acudiente`,
    auth: `${API_BASE}/auth`
};