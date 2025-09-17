import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";

interface PublicRouteProps {
  children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { isAuthenticated} = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/app" />;
  }

  return <>{children}</>;
};

export default PublicRoute;