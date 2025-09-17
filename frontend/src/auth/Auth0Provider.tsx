import { Auth0Provider } from '@auth0/auth0-react';
import type { ReactNode } from 'react';

interface Auth0ProviderWrapperProps {
  children: ReactNode;
}

const Auth0ProviderWrapper = ({ children }: Auth0ProviderWrapperProps) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const redirectUri = window.location.origin;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        scope: "openid profile email"
      }}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWrapper;