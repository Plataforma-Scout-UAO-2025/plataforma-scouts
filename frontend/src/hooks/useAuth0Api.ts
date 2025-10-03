import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setAuth0TokenProvider } from '../api/axios';

/**
 * Hook personalizado para configurar la integración entre Auth0 y Axios
 * Debe ser usado en el componente raíz de la aplicación para configurar
 * el proveedor de tokens de Auth0 en las peticiones HTTP
 */
export const useAuth0Api = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Configurar el proveedor de tokens de Auth0 en axios
      setAuth0TokenProvider(async () => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: import.meta.env.VITE_AUTH0_AUDIENCE,
            },
          });
          return token;
        } catch (error) {
          console.error('Error al obtener el token de Auth0:', error);
          throw error;
        }
      });
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return {
    isAuthenticated,
    isLoading,
  };
};