import { Navigate, Outlet } from "react-router-dom";
import FullScreenLoader from "../common/FullScreenLoader";
import { useAuth0 } from "@auth0/auth0-react";

const PublicRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated && user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;