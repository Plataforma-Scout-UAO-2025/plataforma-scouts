import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";


const LoginButton = ({ children = "Iniciar Sesión", ...props }) => {
  const { loginWithRedirect } = useAuth0();

  const handleClick = () => {
      loginWithRedirect();
    }

  return (
    <Button onClick={handleClick} {...props}>
      { children }
    </Button>
  );
};

export default LoginButton;