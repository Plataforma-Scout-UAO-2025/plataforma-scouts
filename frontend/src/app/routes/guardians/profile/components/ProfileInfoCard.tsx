import { User, Phone, Mail, CreditCard, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ProfileInfoCardProps {
  first_name: string;
  last_name: string;
  identification: string;
  documentType: string;
  email: string;
  emailAlt?: string;
  phone: string;
  phoneAlt?: string;
  address: string;
}

export default function ProfileInfoCard({
  first_name,
  last_name,
  identification,
  documentType,
  email,
  phone,
  address
}: ProfileInfoCardProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Información Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#1a4134]" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Nombres</Label>
              <p className="text-sm">{first_name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Apellidos</Label>
              <p className="text-sm">{last_name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Tipo de documento
              </Label>
              <p className="text-sm">{documentType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Identificación</Label>
              <p className="text-sm">{identification}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email principal
            </Label>
            <p className="text-sm">{email}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Teléfono principal
            </Label>
            <p className="text-sm">{phone}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Dirección
            </Label>
            <p className="text-sm">{address}</p>
          </div> 
                    
        </CardContent>
      </Card>

    </div>
  );
}
