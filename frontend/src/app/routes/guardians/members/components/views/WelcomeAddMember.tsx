import { UserPlus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';


interface WelcomeAddMemberProps {
  userName?: string;
}

export default function WelcomeAddMember({ 
  userName = "Juan Esteban"
}: WelcomeAddMemberProps) {
  const navigate = useNavigate();

  const handleAddMember = () => {
    navigate('/inscripcion');
  };

  return (
    <div className="flex h-screen bg-[#fffaf3]">
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Área de trabajo</h1>
        </div>

        {/* Welcome Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="text-center max-w-md">
            {/* Icon */}
            <div className="mx-auto w-24 h-24 bg-[#1a4134]/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-[#1a4134]" />
            </div>

            {/* Main Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Bienvenido, {userName}!
            </h2>
            
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Añade a tus miembros aquí
            </h3>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Comienza registrando la información de los scouts que están bajo tu responsabilidad. 
              Podrás gestionar sus datos y dar seguimiento a su progreso en la tropa.
            </p>

            {/* Primary Action Button */}
            <Button
              onClick={handleAddMember}
              size="lg"
              className="bg-[#1a4134] hover:bg-[#1a4134]/90 text-white px-8 py-3 text-base font-medium"
            >
              <UserPlus className="mr-2 h-5 w-5" />
              + Agregar mi primer miembro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}