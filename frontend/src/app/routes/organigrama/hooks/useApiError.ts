<<<<<<< HEAD
import { useState } from 'react';
=======
import { useState, useCallback } from 'react';
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
import { ApiError } from '../services/apiClient';

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

<<<<<<< HEAD
  const handleError = (error: unknown) => {
=======
  const handleError = useCallback((error: unknown) => {
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f
    console.error('Error de API:', error);
    
    if (error instanceof ApiError) {
      switch (error.status) {
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
            message: `Error del servidor: ${error.message}`,
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
<<<<<<< HEAD
  };

  const clearError = () => {
    setError({ hasError: false, message: '', type: 'error' });
  };
=======
  }, []);

  const clearError = useCallback(() => {
    setError({ hasError: false, message: '', type: 'error' });
  }, []);
>>>>>>> cef7580cf5e0da05d144eedbaae2249b5c47eb3f

  return {
    error,
    handleError,
    clearError
  };
};