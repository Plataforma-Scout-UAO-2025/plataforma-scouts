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
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    }
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  return {
    emergencyContacts,
    setEmergencyContacts,
    addEmergencyContact,
    removeEmergencyContact,
    updateEmergencyContact,
  };
};
