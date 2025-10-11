import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  action: () => void;
  color: string;
}

export default function QuickActions() {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Ver Miembros a Cargo",
      description: "Gestiona la información de tus miembros",
      icon: Users,
      action: () => navigate('/app/acudiente/dashboard'),
      color: "bg-blue-500"
    },
    {
      title: "Mi Perfil",
      description: "Actualiza tu información personal",
      icon: Settings,
      action: () => navigate('/app/acudiente/perfil'),
      color: "bg-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quickActions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Card key={index} className="hover:shadow-xl hover:scale-101 transition-all duration-300 ease-in-out" onClick={action.action}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
