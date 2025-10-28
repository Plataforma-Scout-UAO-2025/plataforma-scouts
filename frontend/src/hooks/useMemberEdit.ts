import { useState } from "react";
import type { Member, UpdateMember, EmergencyContact } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import { updateMemberAction, fetchMembersByStatusAction } from "@/store/members/membersActions";
import { toast } from "sonner";

type AnyMember = Member | UpdateMember;

function getMemberId(m?: AnyMember | null): number | undefined {
  if (!m) return undefined;
  const updateMember = m as UpdateMember;
  const member = m as Member;
  return updateMember.memberId ?? member.member_id ?? (m as any).memberId;
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

export function useMemberEdit({
  member,
  onSuccess,
  onClose,
}: UseMemberEditArgs) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UpdateMember>>({});

  const memberId = getMemberId(member);

  const initEdit = () => {
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

    // DEBUG: Buscar contactos de emergencia
    const memberAny = member as any;
    console.log("🔍 initEdit - Buscando contactos:", {
      emergency_contacts: memberAny.emergency_contacts,
      emergencyContacts: memberAny.emergencyContacts,
      fullMember: member
    });

    const emergencyContacts = memberAny.emergency_contacts ?? 
                             memberAny.emergencyContacts ?? 
                             [];
    
    console.log("🔍 initEdit - Contactos encontrados:", emergencyContacts);
    console.log("🔍 initEdit - Es array?", Array.isArray(emergencyContacts));
    console.log("🔍 initEdit - Length:", emergencyContacts.length);

    if (Array.isArray(emergencyContacts) && emergencyContacts.length > 0) {
      initialData.emergencyContacts = emergencyContacts.map((contact: any) => ({
        name: contact.name || "",
        relationship: contact.relationship || "",
        phone: contact.phone || "",
      }));
      console.log("✅ initEdit - Contactos mapeados:", initialData.emergencyContacts);
    } else {
      initialData.emergencyContacts = [];
      console.log("⚠️ initEdit - No hay contactos, array vacío");
    }

    setEditedData(initialData);
  };

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

    // Validar campos obligatorios básicos
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

    // Validar formato de teléfono
    if (editedData.phone && !validatePhone(editedData.phone)) {
      toast.error("El teléfono debe contener solo números (entre 7 y 15 dígitos). Puede incluir + al inicio.");
      return;
    }

    // Validar que peso y altura sean números positivos
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

    // Validar contactos de emergencia
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

      // Incluir contactos de emergencia solo si existen y tienen datos válidos
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

      console.log("Payload enviado:", payload);

      await dispatch(updateMemberAction(payload)).unwrap();

      const firstName = editedData.firstName || "";
      const lastName = editedData.lastName || "";
      toast.success(
        `La información de ${firstName} ${lastName} fue actualizada exitosamente.`
      );

      await dispatch(fetchMembersByStatusAction("APPROVED"));

      onClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al actualizar miembro:", error);
      
      let errorMessage = "Ocurrió un error al actualizar la información.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
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