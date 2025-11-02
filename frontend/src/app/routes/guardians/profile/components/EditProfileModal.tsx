import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';

const editProfileSchema = z.object({
  firstName: z.string().min(1, 'Los nombres son obligatorios'),
  lastName: z.string().min(1, 'Los apellidos son obligatorios'),
  identification: z.string().min(1, 'La identificación es obligatoria'),
  documentType: z.string().min(1, 'El tipo de documento es obligatorio'),
  email: z.string().email('Email inválido'),
  emailAlt: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(1, 'El teléfono principal es obligatorio'),
  phoneAlt: z.string().optional(),
  address: z.string().min(1, 'La dirección es obligatoria'),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditProfileFormData) => void;
  initialData: EditProfileFormData;
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: initialData
  });

  // Con este useeffect se puede resetear el formulario cada vez que se abre el modal
  // (no carga valores por defecto, los jala de BD directamente)
  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  const onSubmit = async (data: EditProfileFormData) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a4134]">
            Editar Perfil
          </DialogTitle>
          <DialogDescription>
            Actualiza tu información personal y de contacto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Fila 1: Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombres *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                className={`w-full ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Apellidos *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                className={`w-full ${errors.lastName ? 'border-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Fila 2: Tipo de documento e identificación */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="documentType">Tipo de documento *</Label>
              <Select 
                defaultValue={initialData.documentType}
                onValueChange={(value) => setValue('documentType', value)}
              >
                <SelectTrigger className="bg-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PA">Pasaporte</SelectItem>
                </SelectContent>
              </Select>
              {errors.documentType && (
                <p className="text-red-500 text-sm mt-1">{errors.documentType.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="identification">Identificación *</Label>
              <Input
                id="identification"
                {...register('identification')}
                className={`w-full ${errors.identification ? 'border-red-500' : ''}`}
              />
              {errors.identification && (
                <p className="text-red-500 text-sm mt-1">{errors.identification.message}</p>
              )}
            </div>
          </div>

          {/* Fila 3: Emails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email principal *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="emailAlt">Email alternativo</Label>
              <Input
                id="emailAlt"
                type="email"
                {...register('emailAlt')}
                className={`w-full ${errors.emailAlt ? 'border-red-500' : ''}`}
              />
              {errors.emailAlt && (
                <p className="text-red-500 text-sm mt-1">{errors.emailAlt.message}</p>
              )}
            </div>
          </div>

          {/* Fila 4: Teléfonos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Teléfono principal *</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full ${errors.phone ? 'border-red-500' : ''}`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phoneAlt">Teléfono alternativo</Label>
              <Input
                id="phoneAlt"
                type="tel"
                {...register('phoneAlt')}
                className="w-full"
              />
            </div>
          </div>

          {/* Fila 5: Dirección */}
          <div>
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              {...register('address')}
              className={`w-full ${errors.address ? 'border-red-500' : ''}`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
            )}
          </div>

          {/* Footer del modal */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1a4134] hover:bg-[#2d5a47] text-white"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
