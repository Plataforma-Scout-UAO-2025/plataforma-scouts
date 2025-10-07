import type { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { MemberFormData } from '../../schemas/MemberForm.schema';

interface PersonalInfoFormProps {
  register: UseFormRegister<MemberFormData>;
  errors: FieldErrors<MemberFormData>;
  setValue: UseFormSetValue<MemberFormData>;
}

export default function PersonalInfoForm({ register, errors, setValue }: PersonalInfoFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[#1a4134]">Información Personal</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <Label htmlFor="firstName">Nombre *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Ej: Juan"
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
          )}
        </div>

        {/* Apellidos */}
        <div>
          <Label htmlFor="lastName">Apellidos *</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Ej: Pérez García"
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
          )}
        </div>

        {/* Tipo de Documento */}
        <div>
          <Label htmlFor="documentType">Tipo de Documento *</Label>
          <Select onValueChange={(value) => setValue('documentType', value as MemberFormData['documentType'])}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
              <SelectItem value="PA">Pasaporte</SelectItem>
            </SelectContent>
          </Select>
          {errors.documentType && (
            <p className="text-sm text-red-500 mt-1">{errors.documentType.message}</p>
          )}
        </div>

        {/* Número de Documento */}
        <div>
          <Label htmlFor="identification">Número de Documento *</Label>
          <Input
            id="identification"
            {...register('identification')}
            placeholder="Ej: 1234567890"
          />
          {errors.identification && (
            <p className="text-sm text-red-500 mt-1">{errors.identification.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Ej: correo@ejemplo.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Género */}
        <div>
          <Label htmlFor="gender">Género *</Label>
          <Select onValueChange={(value) => setValue('gender', value as MemberFormData['gender'])}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Masculino</SelectItem>
              <SelectItem value="FEMALE">Femenino</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
          )}
        </div>

        {/* Fecha de Nacimiento */}
        <div>
          <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
          <Input
            id="birthDate"
            type="date"
            {...register('birthDate')}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-500 mt-1">{errors.birthDate.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Ej: +57 300 123 4567"
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Dirección */}
        <div className="col-span-2">
          <Label htmlFor="address">Dirección *</Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="Ej: Calle 5 # 10-20, Cali"
          />
          {errors.address && (
            <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* Rol */}
        <div>
          <Label htmlFor="role">Rol en el Grupo</Label>
          <Select onValueChange={(value) => setValue('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lobato">Lobato</SelectItem>
              <SelectItem value="Scout">Scout</SelectItem>
              <SelectItem value="Caminante">Caminante</SelectItem>
              <SelectItem value="Rover">Rover</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fecha de Aceptación */}
        <div>
          <Label htmlFor="acceptanceDate">Fecha de Aceptación *</Label>
          <Input
            id="acceptanceDate"
            type="date"
            {...register('acceptanceDate')}
          />
          {errors.acceptanceDate && (
            <p className="text-sm text-red-500 mt-1">{errors.acceptanceDate.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
