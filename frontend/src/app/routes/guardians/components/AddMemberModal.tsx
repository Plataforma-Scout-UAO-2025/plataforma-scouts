import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { miembroFormSchema, type MiembroFormData } from '../schemas/MemberForm.schema';
import PersonalInfoForm from './member-form/PersonalInfoForm';
import HealthInfoForm from './member-form/HealthInfoForm';
import EmergencyContactsForm, { type EmergencyContact } from './member-form/EmergencyContactsForm';
import SuccessCard from './member-form/SuccessCard';

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
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '' }
  ]);
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
  } = useForm<MiembroFormData>({
    resolver: zodResolver(miembroFormSchema)
  });

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

  const validateEmergencyContacts = (): boolean => {
    return emergencyContacts.some(contact => 
      contact.name.trim() !== '' && 
      contact.relationship.trim() !== '' && 
      contact.phone.trim() !== ''
    );
  };

  const onSubmit = async (data: MiembroFormData) => {
    setErrorMessage('');
    
    if (!validateEmergencyContacts()) {
      setErrorMessage("Debes agregar al menos un contacto de emergencia completo");
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fullName = `${data.firstName} ${data.lastName}`;
      setAddedMemberName(fullName);

      reset();
      setEmergencyContacts([{ name: '', relationship: '', phone: '' }]);

      if (isFirstMember) {
        setShowSuccessCard(true);
      } else {
        onSuccess();
      }
    } catch (error) {
      setErrorMessage("No se pudo agregar el miembro. Intenta de nuevo.");
    }
  };

  const handleViewMembers = () => {
    setShowSuccessCard(false);
    onSuccess();
    navigate('/guardians/members');
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
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              <PersonalInfoForm register={register} errors={errors} setValue={setValue} />
              <HealthInfoForm register={register} errors={errors} />
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
