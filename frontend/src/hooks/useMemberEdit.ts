import { useState, useCallback } from "react";
import type { Member, UpdateMember, EmergencyContact } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import { updateMemberAction, fetchMembersByStatusAction } from "@/store/members/membersActions";
import { toast } from "sonner";

type AnyMember = Member | UpdateMember;

interface MemberWithId extends Record<string, unknown> {
  memberId?: number;
  member_id?: number;
}

function getMemberId(m?: AnyMember | null): number | undefined {
  if (!m) return undefined;
  const memberWithId = m as MemberWithId;
  return memberWithId.memberId ?? memberWithId.member_id;
}

function getMemberField(
  member: AnyMember | null,
  camelKey: keyof UpdateMember,
  snakeKey: keyof Member
): string {
  if (!member) return "";
  const m = member as Record<string, unknown>;
  return String(m[camelKey] ?? m[snakeKey] ?? "");
}

interface UseMemberEditArgs {
  member: AnyMember | null;
  onSuccess: () => void;
  onClose: () => void;
}

interface EmergencyContactRaw {
  name?: string;
  relationship?: string;
  phone?: string;
}

export function useMemberEdit({
  member,
  onSuccess,
  onClose,
}: UseMemberEditArgs) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UpdateMember>>({});

  const memberId = getMemberId(member);

  const initEdit = useCallback(() => {
    if (!member) {
      setEditedData({});
      return;
    }

    const initialData: Partial<UpdateMember> = {
      firstName: getMemberField(member, "firstName", "first_name"),
      lastName: getMemberField(member, "lastName", "last_name"),
      identification: getMemberField(member, "identification", "identification"),
      documentType: getMemberField(member, "documentType", "document_type"),
      email: getMemberField(member, "email", "email"),
      phone: getMemberField(member, "phone", "phone"),
      address: getMemberField(member, "address", "address"),
      gender: getMemberField(member, "gender", "gender"),
      weight: getMemberField(member, "weight", "weight"),
      height: getMemberField(member, "height", "height"),
      hobbies: getMemberField(member, "hobbies", "hobbies"),
      sports: getMemberField(member, "sports", "sports"),
      instruments: getMemberField(member, "instruments", "instruments"),
    };

    const birthDate = (member as Member).birth_date ?? (member as UpdateMember).birthDate;
    if (birthDate) {
      initialData.birthDate = birthDate;
    }

    const memberWithContacts = member as Member & { emergencyContacts?: EmergencyContact[] };
    const emergencyContacts = memberWithContacts.emergency_contacts ?? 
                             memberWithContacts.emergencyContacts ?? 
                             [];

    if (Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
      initialData.emergencyContacts = emergencyContacts.map((contact: EmergencyContactRaw) => ({
        name: contact.name || "",
        relationship: contact.relationship || "",
        phone: contact.phone || "",
      }));
    } else {
      initialData.emergencyContacts = [];
    }

    setEditedData(initialData);
  }, [member]);

  const handleFieldChange = (
    field: keyof UpdateMember,
    value: string | Date | EmergencyContact[]
  ) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateEmergencyContacts = (contacts: EmergencyContact[]): boolean => {
    if (!contacts || contacts.length === 0) return true;

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      if (!contact.name || contact.name.trim() === "") {
        toast.error(`El nombre del contacto de emergencia ${i + 1} es obligatorio.`);
        return false;
      }

      if (!contact.relationship || contact.relationship.trim() === "") {
        toast.error(`La relación del contacto de emergencia ${i + 1} es obligatoria.`);
        return false;
      }

      if (!contact.phone || contact.phone.trim() === "") {
        toast.error(`El teléfono del contacto de emergencia ${i + 1} es obligatorio.`);
        return false;
      }

      if (!validatePhone(contact.phone)) {
        toast.error(`El teléfono del contacto de emergencia ${i + 1} debe contener entre 7 y 15 dígitos.`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!memberId) {
      toast.error("No se pudo identificar el miembro (ID inválido).");
      return;
    }

    const requiredFields = {
      phone: "Teléfono",
      address: "Dirección",
      weight: "Peso",
      height: "Altura",
    };
    
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = editedData[field as keyof UpdateMember];
      if (!value || String(value).trim() === "") {
        toast.error(`El campo ${label} es obligatorio.`);
        return;
      }
    }

    if (editedData.phone && !validatePhone(editedData.phone)) {
      toast.error("El teléfono debe contener solo números (entre 7 y 15 dígitos). Puede incluir + al inicio.");
      return;
    }

    const weight = editedData.weight ? parseFloat(editedData.weight) : 0;
    const height = editedData.height ? parseFloat(editedData.height) : 0;

    if (isNaN(weight) || weight <= 0) {
      toast.error("El peso debe ser un número válido mayor a 0.");
      return;
    }

    if (isNaN(height) || height <= 0) {
      toast.error("La altura debe ser un número válido mayor a 0.");
      return;
    }

    if (editedData.emergencyContacts && !validateEmergencyContacts(editedData.emergencyContacts)) {
      return;
    }

    try {
      setLoading(true);

      const updates: Partial<UpdateMember> = {};

      if (editedData.phone) {
        const cleanPhone = editedData.phone.replace(/[\s-()]/g, '');
        updates.phone = cleanPhone;
      }

      if (editedData.address) {
        updates.address = editedData.address.trim();
      }

      if (editedData.weight) {
        updates.weight = String(weight);
      }

      if (editedData.height) {
        updates.height = String(height);
      }

      if (editedData.emergencyContacts && editedData.emergencyContacts.length > 0) {
        const validContacts = editedData.emergencyContacts.filter(
          contact => contact.name && contact.relationship && contact.phone
        );

        if (validContacts.length > 0) {
          updates.emergencyContacts = validContacts.map(contact => ({
            name: contact.name.trim(),
            relationship: contact.relationship.trim(),
            phone: contact.phone.replace(/[\s-()]/g, ''),
          }));
        }
      }

      const payload = {
        uid: String(memberId),
        updates: updates,
      };

      await dispatch(updateMemberAction(payload)).unwrap();

      const firstName = editedData.firstName || "";
      const lastName = editedData.lastName || "";
      toast.success(
        `La información de ${firstName} ${lastName} fue actualizada exitosamente.`
      );

      await dispatch(fetchMembersByStatusAction("APPROVED"));

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error al actualizar miembro:", error);
      
      let errorMessage = "Ocurrió un error al actualizar la información.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData({});
    onClose();
  };

  return {
    loading,
    editedData,
    setEditedData,
    handleFieldChange,
    handleSave,
    handleCancel,
    initEdit,
  };
}