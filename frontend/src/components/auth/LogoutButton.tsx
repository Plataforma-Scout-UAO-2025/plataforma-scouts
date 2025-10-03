import { LogOut } from "lucide-react";

// Componente que solo renderiza el contenido visual del logout
// La lógica de onClick se maneja en el componente padre
const LogoutButton = () => {
  return (
    <>
      <LogOut />
      <span>Cerrar sesión</span>
    </>
  );
};

export default LogoutButton;