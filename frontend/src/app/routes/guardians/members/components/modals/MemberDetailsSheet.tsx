import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Activity,
  Heart,
  MapPin,
  Phone,
} from 'lucide-react';
import type { Member } from '../../types/member.type';

interface MiembroDetallesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  miembro: Member | null;
  onEdit: (miembro: Member) => void;
}

export default function MiembroDetallesSheet({
  isOpen,
  onClose,
  miembro,
  onEdit,
}: MiembroDetallesSheetProps) {
  if (!miembro) return null;

  const calcularEdad = (fechaNacimiento: string): number => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const edad = calcularEdad(miembro.birthDate);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 px-6">
          <div>
            <SheetTitle className="text-2xl font-bold text-[#1a4134]">
              Detalles del Integrante
            </SheetTitle>
            <SheetDescription className="text-base">
              Información completa del miembro de la tropa
            </SheetDescription>
          </div>
          
          {/* Avatar y info básica */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-[#1a4134] flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#1a4134]">
                {miembro.firstName} {miembro.lastName}
              </h3>
              <Badge 
                variant={miembro.isActive ? 'default' : 'secondary'}
                className={miembro.isActive ? 'bg-green-100 text-green-800' : ''}
              >
                {miembro.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 pb-6 px-6">
          {/* Información Personal */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-[#1a4134]" />
              <h4 className="text-lg font-semibold text-[#1a4134]">Información Personal</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm font-medium text-gray-600">Edad</p>
                <p className="text-base">{edad} años</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rol</p>
                <p className="text-base">{miembro.role || 'Scout Aspirante'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Identificación</p>
                <p className="text-base font-mono">{miembro.documentType} {miembro.identification}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-base">{miembro.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Género</p>
                <p className="text-base">{miembro.gender === 'MALE' ? 'Masculino' : miembro.gender === 'FEMALE' ? 'Femenino' : 'Otro'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Fecha de Nacimiento</p>
                <p className="text-base">
                  {new Date(miembro.birthDate).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">Teléfono</p>
                <p className="text-base">{miembro.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Física */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-[#1a4134]" />
              <h4 className="text-lg font-semibold text-[#1a4134]">Información Física</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <p className="text-sm font-medium text-gray-600">Peso</p>
                <p className="text-base">{miembro.weight || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Altura</p>
                <p className="text-base">{miembro.height || 'No especificado'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Intereses y Habilidades */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-[#1a4134]" />
              <h4 className="text-lg font-semibold text-[#1a4134]">Intereses y Habilidades</h4>
            </div>
            <div className="grid grid-cols-1 gap-4 pl-7">
              <div>
                <p className="text-sm font-medium text-gray-600">Hobbies</p>
                <p className="text-base">{miembro.hobbies || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Deportes</p>
                <p className="text-base">{miembro.sports || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Instrumentos</p>
                <p className="text-base">{miembro.instruments || 'No especificado'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dirección */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-[#1a4134]" />
              <h4 className="text-lg font-semibold text-[#1a4134]">Dirección</h4>
            </div>
            <div className="pl-7">
              <p className="text-base">{miembro.address}</p>
            </div>
          </div>

          <Separator />

          {/* Contactos de Emergencia */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-[#1a4134]" />
              <h4 className="text-lg font-semibold text-[#1a4134]">Contactos de Emergencia</h4>
            </div>
            <div className="space-y-3 pl-7">
              {miembro.emergencyContacts && miembro.emergencyContacts.length > 0 ? (
                miembro.emergencyContacts.map((contacto, index) => (
                  <Card key={index} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Nombre</p>
                          <p className="text-base font-medium">{contacto.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Relación</p>
                          <p className="text-base">{contacto.relationship}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-medium text-gray-600">Teléfono</p>
                          <p className="text-base">{contacto.phone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-base text-gray-500">No hay contactos de emergencia registrados</p>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="space-x-2 pt-6 border-t px-6">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button 
            onClick={() => onEdit(miembro)}
            className="bg-[#1a4134] hover:bg-[#29765C] text-white"
          >
            Editar Miembro
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}