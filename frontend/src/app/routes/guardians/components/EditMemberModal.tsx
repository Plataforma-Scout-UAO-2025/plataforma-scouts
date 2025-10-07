import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Miembro } from '../types/member.type';
import { miembroFormSchema, type MiembroFormData } from '../schemas/MemberForm.schema';
import PersonalInfoForm from './member-form/PersonalInfoForm';
import HealthInfoForm from './member-form/HealthInfoForm';
import EmergencyContactsForm, { type EmergencyContact } from './member-form/EmergencyContactsForm';

interface EditarMiembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  miembro: Miembro | null;
  onSave: (data: MiembroFormData) => void;
}

export default function EditarMiembroModal({
  isOpen,
  onClose,
  miembro,
  onSave,
}: EditarMiembroModalProps) {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '' }
  ]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MiembroFormData>({
    resolver: zodResolver(miembroFormSchema)
  });

  // Pre-llenar el formulario cuando se abre con un miembro
  useEffect(() => {
    if (miembro && isOpen) {
      reset({
        firstName: miembro.firstName,
        lastName: miembro.lastName,
        email: miembro.email,
        tipoDocumento: miembro.tipoDocumento,
        identification: miembro.identification,
        genero: miembro.genero,
        fechaNacimiento: miembro.fechaNacimiento,
        telefono: miembro.telefono,
        direccion: miembro.direccion,
        rol: miembro.rol || '',
        fechaAceptacion: miembro.fechaAceptacion,
        isActive: miembro.isActive,
        peso: miembro.peso || '',
        altura: miembro.altura || '',
        hobbies: miembro.hobbies || '',
        deportes: miembro.deportes || '',
        instrumentos: miembro.instrumentos || '',
      });

      // Convertir contactos de emergencia al formato correcto
      if (miembro.contactosEmergencia && miembro.contactosEmergencia.length > 0) {
        const convertedContacts = miembro.contactosEmergencia.map(contact => ({
          name: contact.nombreCompleto,
          relationship: contact.relacion,
          phone: contact.telefono
        }));
        setEmergencyContacts(convertedContacts);
      }
    }
  }, [miembro, isOpen, reset]);

  const addEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '' }]);
    }
  };

  const removeEmergencyContact = (index: number) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    }
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const onSubmit = async (data: MiembroFormData) => {
    try {
      onSave(data);
      toast.success('Miembro actualizado correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el miembro');
    }
  };

  const handleClose = () => {
    reset();
    setEmergencyContacts([{ name: '', relationship: '', phone: '' }]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1a4134]">
            Editar Miembro
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <PersonalInfoForm register={register} errors={errors} setValue={setValue} />
          <HealthInfoForm register={register} errors={errors} />
          <EmergencyContactsForm
            emergencyContacts={emergencyContacts}
            onAdd={addEmergencyContact}
            onRemove={removeEmergencyContact}
            onUpdate={updateEmergencyContact}
          />

          <DialogFooter className="space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1a4134] hover:bg-[#29765C] text-white"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
