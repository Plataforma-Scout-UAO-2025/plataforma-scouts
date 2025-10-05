import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  HelpCircle,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  userName?: string;
  userGroup?: string;
  activeRoute?: string;
}

export default function Sidebar({ 
  userName = "Juan Esteban Torres", 
  userGroup = "MANADA KUNA",
  activeRoute = "inicio"
}: SidebarProps) {
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'inicio', icon: Home, label: 'Inicio', href: '/acudientes' },
    { id: 'tropa', icon: Users, label: 'Tropa', href: '/acudientes/tropa' },
    { id: 'eventos', icon: Calendar, label: 'Eventos', href: '/acudientes/eventos' },
    { id: 'financiero', icon: DollarSign, label: 'Financiero', href: '/acudientes/financiero' },
  ];

  const supportItems = [
    { id: 'ayuda', icon: HelpCircle, label: 'Ayuda', href: '/acudientes/ayuda' },
    { id: 'logout', icon: LogOut, label: 'Cerrar sesión', href: '/logout' },
  ];

  return (
    <div className="w-72 bg-[#1a4134] text-white flex flex-col h-screen">
      {/* Header del usuario */}
      <div className="p-6 border-b border-[#29765C]">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-[#29765C] text-white text-lg font-semibold">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-300 truncate">
              {userGroup}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            
            const handleClick = () => {
              switch (item.id) {
                case 'inicio':
                  navigate('/'); // Navegar a la página de inicio principal
                  break;
                case 'tropa':
                  // Ya estamos en la página de tropa (miembros a cargo), no navegar
                  console.log('Ya estás en la sección de Tropa');
                  break;
                case 'eventos':
                  navigate('/acudientes/eventos');
                  break;
                case 'financiero':
                  navigate('/acudientes/financiero');
                  break;
                default:
                  console.log(`Navegando a: ${item.label}`);
              }
            };
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={handleClick}
                className={`w-full justify-start space-x-3 h-12 text-white hover:bg-[#29765C] hover:text-white ${
                  isActive ? 'bg-[#29765C] text-white' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Footer con ayuda y logout */}
      <div className="p-4 border-t border-[#29765C]">
        <div className="space-y-2">
          {supportItems.map((item) => {
            const Icon = item.icon;
            
            const handleSupportClick = () => {
              switch (item.id) {
                case 'ayuda':
                  console.log('Abriendo sección de Ayuda - Funcionalidad pendiente');
                  // navigate('/acudientes/ayuda'); // Cuando esté disponible
                  break;
                case 'logout':
                  console.log('Cerrando sesión...');
                  // Aquí podrías agregar la lógica de logout con Auth0
                  // logout({ returnTo: window.location.origin });
                  navigate('/');
                  break;
                default:
                  console.log(`Acción: ${item.label}`);
              }
            };
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={handleSupportClick}
                className="w-full justify-start space-x-3 h-12 text-white hover:bg-[#29765C] hover:text-white"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}