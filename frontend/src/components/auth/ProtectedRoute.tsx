import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import FullScreenLoader from "../common/FullScreenLoader";
import { useRoleContext } from "@/hooks/useRoleContext";
import { DEV_CONFIG } from "@/config/dev.config";

const ProtectedRoute = ({allowedRoles, children}: {allowedRoles: string[]; children: React.ReactNode}) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const { currentUserRole } = useRoleContext();

  // ⚠️ MODO DEV: Bypass de autenticación para desarrollo sin backend
  if (DEV_CONFIG.skipAuth) {
    return <>{children}</>;
  }

  if (isLoading) return <FullScreenLoader />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUserRole || !allowedRoles.includes(currentUserRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;