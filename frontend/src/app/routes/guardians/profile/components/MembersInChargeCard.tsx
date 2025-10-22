import { Users, Flag, Calendar, Badge as BadgeIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface MiembroACargo {
  id: number;
  fullName: string;
  rama: string;
  parentesco: string;
  isActive: boolean;
}

interface MembersInChargeCardProps {
  miembrosACargo: MiembroACargo[];
  grupo: string;
  role: string;
  joinDate: string;
  isActive: boolean;
  onViewMember: (id: number) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export default function MembersInChargeCard({
  miembrosACargo,
  grupo,
  role,
  joinDate,
  isActive,
  onViewMember
}: MembersInChargeCardProps) {
  return (
    <>
      {/* Miembros a Cargo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#1a4134]" />
            Miembros a Cargo
            <Badge variant="secondary" className="ml-2">
              {miembrosACargo.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {miembrosACargo.map((miembro) => (
              <div key={miembro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{miembro.fullName}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{miembro.rama}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-[#1a4134] font-medium">{miembro.parentesco}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={miembro.isActive ? "default" : "secondary"}
                    className={miembro.isActive ? "bg-green-100 text-green-800 text-xs" : "text-xs"}
                  >
                    {miembro.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewMember(miembro.id)}
                    className="text-xs border-[#1a4134] text-[#1a4134] hover:bg-[#1a4134] hover:text-white"
                  >
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información del Grupo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-[#1a4134]" />
            Información del Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Grupo Scout</Label>
            <p className="text-sm font-medium">{grupo}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Fecha de ingreso
            </Label>
            <p className="text-sm">{formatDate(joinDate)}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <BadgeIcon className="h-3 w-3" />
              Rol
            </Label>
            <p className="text-sm">{role}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Estado</Label>
            <Badge 
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-100 text-green-800" : ""}
            >
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
