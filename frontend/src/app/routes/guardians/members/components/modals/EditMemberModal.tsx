import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { Member } from '../../types/member.type';
import { memberFormSchema, type MemberFormData } from '../../schemas/MemberForm.schema';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import HealthInfoForm from '../forms/HealthInfoForm';
import EmergencyContactsForm from '../forms/EmergencyContactsForm';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  miembro: Member | null;
  onSave: (data: MemberFormData) => void;
}

export default function EditarMiembroModal({
  isOpen,
  onClose,
  miembro,
  onSave,
}: EditMemberModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema)
  });

  const { emergencyContacts, setEmergencyContacts, addEmergencyContact, removeEmergencyContact, updateEmergencyContact } = useEmergencyContacts();

  // Pre-llenar el formulario cuando se abre con un miembro
  useEffect(() => {
    if (miembro && isOpen) {
      reset({
        firstName: miembro.firstName,
        lastName: miembro.lastName,
        email: miembro.email,
        documentType: miembro.documentType,
        identification: miembro.identification,
        gender: miembro.gender,
        birthDate: miembro.birthDate,
        phone: miembro.phone,
        address: miembro.address,
        role: miembro.role || '',
        acceptanceDate: miembro.acceptanceDate,
        isActive: miembro.isActive,
        weight: miembro.weight || '',
        height: miembro.height || '',
        hobbies: miembro.hobbies || '',
        sports: miembro.sports || '',
        instruments: miembro.instruments || '',
      });

      // Convertir contactos de emergencia al formato correcto
      if (miembro.emergencyContacts && miembro.emergencyContacts.length > 0) {
        const convertedContacts = miembro.emergencyContacts.map(contact => ({
          name: contact.fullName,
          relationship: contact.relationship,
          phone: contact.phone
        }));
        setEmergencyContacts(convertedContacts);
      }
    }
  }, [miembro, isOpen, reset, setEmergencyContacts]);

  const onSubmit = async (data: MemberFormData) => {
    try {
      onSave(data);
      toast.success('Miembro actualizado correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el miembro: ' + (error instanceof Error ? error.message : String(error)));
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
          <DialogDescription>
            Actualiza la información del miembro seleccionado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <PersonalInfoForm register={register} errors={errors} setValue={setValue} />
          <HealthInfoForm register={register} />
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
