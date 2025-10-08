import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { setAuth0TokenProvider } from "../api/axios";

export const useAuth0ApiWrapper = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setAuth0TokenProvider(async () => {
        const token = await getAccessTokenSilently();

        try {
          const [, payloadBase64] = token.split(".");
          const decodedPayload = JSON.parse(atob(payloadBase64));
          console.log("Decoded JWT Payload:", decodedPayload);

          console.log("org_id:", decodedPayload.org_id);
        } catch (err) {
          console.error("Error al decodificar el token JWT:", err);
        }

        return token;
      });
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  return {
    isAuthenticated,
    isLoading,
  };
};
