import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { memberFormSchema, type MemberFormData } from '../../schemas/MemberForm.schema';
import PersonalInfoForm from '../forms/PersonalInfoForm';
import HealthInfoForm from '../forms/HealthInfoForm';
import EmergencyContactsForm from '../forms/EmergencyContactsForm';
import SuccessCard from '../forms/SuccessCard';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isFirstMember?: boolean;
}

export default function AddMemberModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  isFirstMember = false 
}: AddMemberModalProps) {
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [addedMemberName, setAddedMemberName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

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

  const validateEmergencyContacts = (): boolean => {
    return emergencyContacts.some(contact => 
      contact.name.trim() !== '' && 
      contact.relationship.trim() !== '' && 
      contact.phone.trim() !== ''
    );
  };

  const onSubmit = async (data: MemberFormData) => {
    console.log('=== FORMULARIO ENVIADO ===');
    console.log('Datos del formulario:', data);
    console.log('Contactos de emergencia:', emergencyContacts);
    
    setErrorMessage('');
    
    if (!validateEmergencyContacts()) {
      console.log('⚠️ Validación falló: No hay contactos de emergencia completos');
      setErrorMessage("Debes agregar al menos un contacto de emergencia completo");
      return;
    }

    console.log('✅ Validación pasó, guardando...');
    
    const emergencyContactsFormatted = emergencyContacts
      .filter(contact => contact.name.trim() && contact.relationship.trim() && contact.phone.trim())
      .map(contact => ({
        fullName: contact.name,
        relationship: contact.relationship as 'Padre' | 'Madre' | 'Tutor' | 'Abuelo/a' | 'Tío/a' | 'Hermano/a' | 'Otro',
        phone: contact.phone
      }));

    const dataWithContacts = {
      ...data,
      emergencyContacts: emergencyContactsFormatted
    };

    console.log('Datos completos con contactos:', dataWithContacts);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fullName = `${data.firstName} ${data.lastName}`;
      setAddedMemberName(fullName);

      console.log('✅ Miembro guardado exitosamente:', fullName);

      reset();
      setEmergencyContacts([{ name: '', relationship: '', phone: '' }]);

      setShowSuccessCard(true);
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      setErrorMessage("No se pudo agregar el miembro. Intenta de nuevo.");
    }
  };

  const handleViewMembers = () => {
    setShowSuccessCard(false);
    onSuccess();
    navigate('/app/acudiente/miembros');
  };

  const handleAddAnother = () => {
    setShowSuccessCard(false);
  };

  const handleClose = () => {
    if (!showSuccessCard) {
      reset();
      setEmergencyContacts([{ name: '', relationship: '', phone: '' }]);
    }
    setShowSuccessCard(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!showSuccessCard ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {isFirstMember ? "Agregar mi primer miembro" : "Agregar nuevo miembro"}
              </DialogTitle>
              <DialogDescription>
                Completa la información del miembro que deseas agregar a tu tropa.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <PersonalInfoForm register={register} errors={errors} setValue={setValue} />
              <HealthInfoForm register={register} />
              <EmergencyContactsForm
                emergencyContacts={emergencyContacts}
                onAdd={addEmergencyContact}
                onRemove={removeEmergencyContact}
                onUpdate={updateEmergencyContact}
              />

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1a4134] hover:bg-[#1a4134]/90"
                >
                  {isSubmitting ? "Guardando..." : "Guardar miembro"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <SuccessCard
            memberName={addedMemberName}
            onViewMembers={handleViewMembers}
            onAddAnother={handleAddAnother}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
