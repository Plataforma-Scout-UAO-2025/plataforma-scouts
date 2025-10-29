import { Users} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MiembroACargo {
  id: number;
  fullName: string;
  rama: string;
  parentesco: string;
  isActive: boolean;
}

interface MembersInChargeCardProps {
  miembrosACargo: MiembroACargo[];
  onViewMember: (id: number) => void;
}

export default function MembersInChargeCard({
  miembrosACargo,
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
          <div className="space-y-3 ">
            {miembrosACargo.map((miembro) => (
              <div key={`${miembro.id}-${miembro.fullName}`} className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between p-3 bg-gray-50 rounded-lg">
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
      
    </>
  );
}
