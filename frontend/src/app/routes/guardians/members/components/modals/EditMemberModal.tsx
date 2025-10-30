import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UpdateMember } from '@/types/member.type';
import { updateMember } from '@/api/membersApi';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { editMemberSchema, type EditMemberFormData } from '../../schemas/MemberForm.schema';
import MemberContactForm from './MemberContactForm';
import EmergencyContactsList from './emergencyContact/EmergencyContactList';

interface MemberUpdate extends UpdateMember {
  member_id?: number;
  first_name?: string;
  last_name?: string;
  document_type?: string;
  is_active?: boolean;
  emergency_contacts?: Array<{ name: string; relationship: string; phone: string }>;
}

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  miembro: UpdateMember | null;
  onSuccess?: () => void; 
}

export default function EditMemberModal({
  isOpen,
  onClose,
  miembro,
  onSuccess,
}: EditMemberModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EditMemberFormData>({
    resolver: zodResolver(editMemberSchema)
  });

  const { emergencyContacts, setEmergencyContacts, addEmergencyContact, removeEmergencyContact, updateEmergencyContact } = useEmergencyContacts();

  
  const documentType = watch('documentType');

  useEffect(() => {
    if (miembro && isOpen) {
      const memberData = miembro as MemberUpdate;
      const docType = memberData.document_type ?? memberData.documentType;      
      reset({
        phone: memberData.phone ?? '',
        documentType: docType as EditMemberFormData['documentType'],
        address: memberData.address ?? '',
      });

      if (memberData.emergency_contacts && memberData.emergency_contacts.length > 0) {
        setEmergencyContacts(memberData.emergency_contacts);
      } else if (memberData.emergencyContacts && memberData.emergencyContacts.length > 0) {
        setEmergencyContacts(memberData.emergencyContacts);
      } else {
        setEmergencyContacts([{ name: '', relationship: '', phone: '' }]);
      }
    }
  }, [miembro, isOpen, reset, setEmergencyContacts]);

  const onSubmit = async (data: EditMemberFormData) => {
    try {
      const memberData = miembro as MemberUpdate;
      const id = memberData?.member_id ?? memberData?.memberId;

      if (!id) {
        toast.error("No se encontró el ID del miembro");
        return;
      }
      const updateData = {
      phone: data.phone,
      documentType: data.documentType,
      address: data.address,
      emergencyContacts: emergencyContacts.filter(contact => 
        contact.name && contact.relationship && contact.phone
      ),
    };
      console.log('📤 Datos que se enviarán al backend:', updateData);

      await updateMember(String(id), updateData); 
      //await updateMember(String(id), {
      //  ...updateData,
      //  emergencyContacts: emergencyContacts.filter(contact =>
      //    contact.name && contact.relationship && contact.phone
      //  ),
      //});
      

      toast.success('Miembro actualizado correctamente');
      handleClose();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al actualizar el miembro:', error);
      toast.error('Error al actualizar el miembro: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleClose = () => {
    reset();
    setEmergencyContacts([{ name: '', relationship: '', phone: '' }]);
    onClose();
  };

  const memberData = miembro as MemberUpdate;
  const memberName = `${memberData?.first_name ?? memberData?.firstName ?? ''} ${memberData?.last_name ?? memberData?.lastName ?? ''}`.trim();

return (
  <Dialog open={isOpen} onOpenChange={handleClose}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#1a4134]">
          Editar Información de Contacto
        </DialogTitle>
        <DialogDescription>
          Actualiza los datos de contacto de <strong>{memberName || 'el miembro'}</strong>
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <MemberContactForm
          register={register}
          errors={errors}
          documentType={documentType}
          onDocumentTypeChange={(value) => setValue('documentType', value as NonNullable<EditMemberFormData['documentType']>)}
        />
        
        <EmergencyContactsList
          contacts={emergencyContacts}
          onAdd={addEmergencyContact}
          onUpdate={updateEmergencyContact}
          onRemove={removeEmergencyContact}
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