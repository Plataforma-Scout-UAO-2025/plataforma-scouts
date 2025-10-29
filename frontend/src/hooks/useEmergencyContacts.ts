import { useState } from 'react';
import type { EmergencyContact } from '@/app/routes/guardians/members/components/forms/EmergencyContactsForm';

export const useEmergencyContacts = (initialContacts: EmergencyContact[] = [{ name: '', relationship: '', phone: '' }]) => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(initialContacts);

  const addEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, { name: '', relationship: '', phone: '' }]);
    }
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = emergencyContacts.filter((_, i) => i !== index);
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(newContacts.length > 0 ? newContacts : [{ name: '', relationship: '', phone: '' }]);
    }
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const newContacts = [...emergencyContacts];
    if (newContacts[index]) { // 👈 Verificar que existe antes de actualizar
      newContacts[index] = { ...newContacts[index], [field]: value };
      setEmergencyContacts(newContacts);
    }
  };

  return {
    emergencyContacts,
    setEmergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    updateEmergencyContact,
  };
};
