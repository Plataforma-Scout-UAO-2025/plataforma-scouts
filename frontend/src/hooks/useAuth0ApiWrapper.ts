import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setAuth0TokenProvider } from '../api/axios';
import { DEV_CONFIG } from '@/config/dev.config';

export const useAuth0ApiWrapper = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    // ⚠️ MODO DEV: Skip token setup en desarrollo sin backend
    if (DEV_CONFIG.skipAuth) {
      return;
    }

    if (isAuthenticated && !isLoading) {
      setAuth0TokenProvider(async () => {
        const token = await getAccessTokenSilently();
        return token;
      });
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return {
    isAuthenticated,
    isLoading,
  };
};