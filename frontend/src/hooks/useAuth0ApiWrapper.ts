import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { setAuth0TokenProvider } from "../api/axios";

function decodeJwtPayload(token: string) {
  const [, payload] = token.split(".");
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(base64);
  return JSON.parse(json);
}

export const useAuth0ApiWrapper = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [token, setToken] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated || isLoading) return;
      try {
        const t = await getAccessTokenSilently();
        setToken(t);
        const claims = decodeJwtPayload(t);
        setOrgId(claims?.org_id ?? null);

        setAuth0TokenProvider(async () => getAccessTokenSilently());
      } catch (e) {
        console.error("Auth0 init error:", e);
        setError("No se pudo obtener org_id");
      }
    };
    void init();
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return { isAuthenticated, isLoading, token, orgId, error };
};
