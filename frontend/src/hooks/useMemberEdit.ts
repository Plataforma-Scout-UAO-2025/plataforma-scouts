import { useState, useCallback } from "react";
import type { Member, UpdateMember, EmergencyContact } from "@/types/member.type";
import { useAppDispatch } from "./useAppDispatch";
import { updateMemberAction, assignSubgroupAndSectionAction } from "@/store/members/membersActions";
import { updateMemberRole } from "@/api/membersApi";
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
  selectedSection: string;
  selectedSubgroup: string;
  onSuccess: () => void;
  onClose: () => void;
  onRefresh?: () => void;
}

interface EmergencyContactRaw {
  name?: string;
  relationship?: string;
  phone?: string;
}

export function useMemberEdit({
  member,
  selectedSection,
  selectedSubgroup,
  onSuccess,
  onClose,
  onRefresh,
}: UseMemberEditArgs) {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<UpdateMember>>({});
  const [initialRole, setInitialRole] = useState<string | undefined>(undefined);

  const memberId = getMemberId(member);

  const initEdit = useCallback((targetMember?: AnyMember | null) => {
  const m = targetMember ?? member;
  if (!m) {
    setEditedData({});
    setInitialRole(undefined);
    return;
  }

  // Guardar el rol inicial para detectar cambios
  const memberWithRole = m as Member;
  const currentRole = memberWithRole.role;
  setInitialRole(currentRole);

  const initialData: Partial<UpdateMember> = {
    firstName: getMemberField(m, "firstName", "first_name"),
    lastName: getMemberField(m, "lastName", "last_name"),
    identification: getMemberField(m, "identification", "identification"),
    documentType: getMemberField(m, "documentType", "document_type"),
    email: getMemberField(m, "email", "email"),
    phone: getMemberField(m, "phone", "phone"),
    address: getMemberField(m, "address", "address"),
    gender: getMemberField(m, "gender", "gender"),
    weight: getMemberField(m, "weight", "weight"),
    height: getMemberField(m, "height", "height"),
    hobbies: getMemberField(m, "hobbies", "hobbies"),
    sports: getMemberField(m, "sports", "sports"),
    instruments: getMemberField(m, "instruments", "instruments"),
    role: currentRole, // Agregar el rol al estado inicial
  };

  const birthDate = (m as Member).birth_date ?? (m as UpdateMember).birthDate;
  if (birthDate) initialData.birthDate = birthDate;

  const memberWithContacts = m as Member & { emergencyContacts?: EmergencyContact[] };
  const emergencyContacts =
    memberWithContacts.emergency_contacts ??
    memberWithContacts.emergencyContacts ??
    [];

  initialData.emergencyContacts = Array.isArray(emergencyContacts)
    ? emergencyContacts.map((contact: EmergencyContactRaw) => ({
        name: contact.name || "",
        relationship: contact.relationship || "",
        phone: contact.phone || "",
      }))
    : [];

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

      // Verificar si el rol cambió y actualizar
      if (editedData.role && editedData.role !== initialRole) {
        await updateMemberRole({
          memberId: memberId,
          newRole: editedData.role,
        });
        toast.success(`Rol actualizado a ${editedData.role}`);
      }

      // Asignar subgrupo y sección solo si ambos tienen valores válidos
      const hasValidSubgroup = selectedSubgroup && Number(selectedSubgroup) > 0;
      const hasValidSection = selectedSection && Number(selectedSection) > 0;

      if (hasValidSubgroup || hasValidSection) {
        const assignmentData: {
          memberId: number;
          subGroupId?: number;
          sectionId?: number;
        } = {
          memberId,
        };

        if (hasValidSubgroup) {
          assignmentData.subGroupId = Number(selectedSubgroup);
        }

        if (hasValidSection) {
          assignmentData.sectionId = Number(selectedSection);
        }

        await dispatch(assignSubgroupAndSectionAction(assignmentData)).unwrap();
      }

      const firstName = editedData.firstName || "";
      const lastName = editedData.lastName || "";
      toast.success(
        `La información de ${firstName} ${lastName} fue actualizada exitosamente.`
      );

      onClose();
      onSuccess();
      
      if (onRefresh) {
        onRefresh();
      }
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