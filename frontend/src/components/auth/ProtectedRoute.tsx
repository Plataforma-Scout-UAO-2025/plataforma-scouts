import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, Outlet, useLocation, matchPath } from "react-router-dom";
import FullScreenLoader from "../common/FullScreenLoader";

const rolePermissions: Record<string, string[]> = {
  "": ['ADMIN_GLOBAL'],
  "": ['ADMIN_GRUPO'],
  "": ['COMITE_ADMIN'],
  "": ['DEV_SUPPORT'],
  "": ['SCOUT'],
  "": ['SCOUTER'],
  "": ['TESORERO'],
  "": ['ACUDIENTE'],
  "": ['GUEST'],
  "": ['UNKNOWN']
};

const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) return <FullScreenLoader />;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/" replace />;
  }

  for (const [path, roles] of Object.entries(rolePermissions)) {
    if (matchPath({ path, end: true }, location.pathname)) {
      if (!roles.includes(user?.role || "")) {
        return <Navigate to="/" replace />;
      }
    }
  }

  return <Outlet />;
};


export default ProtectedRoute;