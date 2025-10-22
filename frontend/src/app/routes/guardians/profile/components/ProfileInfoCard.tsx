import { User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ProfileInfoCardProps {
  firstName: string;
  lastName: string;
  identification: string;
  documentType: string;
  email: string;
  emailAlt?: string;
  phone: string;
  phoneAlt?: string;
  address: string;
}

export default function ProfileInfoCard({
  firstName,
  lastName,
  identification,
  documentType,
  email,
  emailAlt,
  phone,
  phoneAlt,
  address
}: ProfileInfoCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-sm">{firstName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Apellidos</Label>
              <p className="text-sm">{lastName}</p>
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

      {/* Información de Contacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-[#1a4134]" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Teléfono principal</Label>
            <p className="text-sm">{phone}</p>
          </div>
          {phoneAlt && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Teléfono alternativo</Label>
              <p className="text-sm">{phoneAlt}</p>
            </div>
          )}
          <div>
            <Label className="text-sm font-medium text-gray-600">Email principal</Label>
            <p className="text-sm">{email}</p>
          </div>
          {emailAlt && (
            <div>
              <Label className="text-sm font-medium text-gray-600">Email alternativo</Label>
              <p className="text-sm">{emailAlt}</p>
            </div>
          )}
          <div>
            <Label className="text-sm font-medium text-gray-600">Dirección</Label>
            <p className="text-sm">{address}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
