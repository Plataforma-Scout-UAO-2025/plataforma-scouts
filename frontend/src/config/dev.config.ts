/**
 * ⚠️ ARCHIVO TEMPORAL PARA DESARROLLO SIN BACKEND ⚠️
 * 
 * Este archivo debe ser eliminado antes de hacer commit/push
 * Solo para visualización y pruebas de UI
 */

export const DEV_MODE = false; // Cambia a true para activar el modo DEV

export const DEV_USER = {
  name: "Juan Esteban Pérez",
  email: "juan.perez@example.com",
  role: "ACUDIENTE" as const,
  sub: "dev-user-123"
};

export const DEV_CONFIG = {
  skipAuth: DEV_MODE, // Ahora depende de DEV_MODE
  mockRole: "ACUDIENTE" as const,
  showDevBanner: DEV_MODE // Ahora depende de DEV_MODE
};
