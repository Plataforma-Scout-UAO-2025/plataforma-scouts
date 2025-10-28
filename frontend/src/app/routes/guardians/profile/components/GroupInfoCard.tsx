import { Flag, Calendar, Badge as BadgeIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface GroupInfoCardProps {
  role: string;
  joinDate: string;
  isActive: boolean;
}

const formatDate = (dateString: string) => {
  if (!dateString || dateString.length !== 10) return 'Sin fecha';
  const [year, month, day] = dateString.split('-');
  if (year && month && day) {
    return `${day}/${month}/${year}`;
  }
  return 'Sin fecha';
};

export default function GroupInfoCard({
  role,
  joinDate,
  isActive
}: GroupInfoCardProps) {
  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-[#1a4134]" />
            Información del Grupo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
    );
}