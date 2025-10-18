import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      className="flex items-center gap-2 w-full"
    >
      <LogOut />
      <span>Cerrar sesión</span>
    </button>
  );
};

export default LogoutButton;