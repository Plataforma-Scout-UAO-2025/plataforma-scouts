import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { EditMemberFormData } from '@/app/routes/guardians/members/schemas/MemberForm.schema';

interface MemberContactFormProps {
  register: UseFormRegister<EditMemberFormData>;
  errors: FieldErrors<EditMemberFormData>;
  documentType?: string;
  onDocumentTypeChange: (value: string) => void;
}

export default function MemberContactForm({
  register,
  errors,
  documentType,
  onDocumentTypeChange
}: MemberContactFormProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg">
      <h3 className="font-semibold text-lg text-[#1a4134]">Datos de Contacto del Miembro</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Documento */}
        <div className="space-y-2">
          <Label htmlFor="documentType">Tipo de Documento</Label>
          <Select value={documentType || ''} onValueChange={onDocumentTypeChange}>
            <SelectTrigger className="bg-white border w-full">
              <SelectValue placeholder="Seleccione tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
              <SelectItem value="RC">Registro Civil</SelectItem>
              <SelectItem value="PA">Pasaporte</SelectItem>
              <SelectItem value="PEP">PEP</SelectItem>
              <SelectItem value="PPT">PPT</SelectItem>
              <SelectItem value="NIT">NIT</SelectItem>
              <SelectItem value="NUIP">NUIP</SelectItem>
            </SelectContent>
          </Select>
          {errors.documentType && (
            <p className="text-sm text-red-600">{errors.documentType.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ej: +573001234567"
              {...register('phone')}
              className="w-full"
            />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            type="text"
            placeholder="Ej: Calle 123 #45-67"
            {...register('address')}
            className="w-full"
          />
        {errors.address && (
          <p className="text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>
    </div>
  );
}