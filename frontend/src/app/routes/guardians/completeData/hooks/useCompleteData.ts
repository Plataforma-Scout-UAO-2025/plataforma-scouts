import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { guardianService } from "@/services/guardianService";

export const useCompleteData = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, isLoading: auth0Loading } = useAuth0();

  useEffect(() => {
    const checkDataComplete = async () => {
      if (auth0Loading || !isAuthenticated || !user?.sub) {
        setIsLoading(false);
        return;
      }

      try {
        const isComplete = await guardianService.verifyCompleteData(user.sub);
        setIsOpen(!isComplete);
      } catch (error) {
        console.error("Error checking complete data:", error);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDataComplete();
  }, [auth0Loading, isAuthenticated, user?.sub]);

  const markDataComplete = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    isLoading,
    markDataComplete,
  };
};