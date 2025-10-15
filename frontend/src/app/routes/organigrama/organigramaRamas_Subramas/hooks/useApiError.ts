import { useState, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { isAxiosError } from 'axios';

interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'error' | 'warning' | 'info';
}

export const useApiError = () => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: '',
    type: 'error'
  });

  const handleError = useCallback((error: unknown) => {
    if (!error) {
      setError({ hasError: false, message: '', type: 'error' });
      return;
    }

    console.error('Error de API:', error);

    if (isAxiosError(error)) {
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      const status = axiosError.response?.status ?? 0;
      const serverMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error ?? axiosError.message;

      switch (status) {
        case 404:
          setError({
            hasError: true,
            message: 'No se encontró el recurso solicitado',
            type: 'warning'
          });
          break;
        case 400:
          setError({
            hasError: true,
            message: 'Los datos enviados son inválidos',
            type: 'error'
          });
          break;
        case 401:
          setError({
            hasError: true,
            message: 'No tienes autorización para realizar esta acción',
            type: 'error'
          });
          break;
        case 403:
          setError({
            hasError: true,
            message: 'No tienes permisos para realizar esta acción',
            type: 'error'
          });
          break;
        case 500:
          setError({
            hasError: true,
            message: 'Error interno del servidor. Intenta más tarde',
            type: 'error'
          });
          break;
        default:
          setError({
            hasError: true,
            message: serverMessage ? `Error del servidor: ${serverMessage}` : 'Error del servidor',
            type: 'error'
          });
      }
    } else if (error instanceof Error) {
      setError({
        hasError: true,
        message: error.message,
        type: 'error'
      });
    } else {
      setError({
        hasError: true,
        message: 'Ha ocurrido un error inesperado',
        type: 'error'
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError({ hasError: false, message: '', type: 'error' });
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};