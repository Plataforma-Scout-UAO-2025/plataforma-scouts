import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";


interface LoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  organization: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ children = "Iniciar Sesión", organization, ...props }) => {
  const { loginWithRedirect } = useAuth0();

  const handleClick = () => {
    loginWithRedirect({
      authorizationParams: {
        organization
      }
    });
  };

  return (
    <Button onClick={handleClick} {...props}>
      { children }
    </Button>
  );
};

export default LoginButton;