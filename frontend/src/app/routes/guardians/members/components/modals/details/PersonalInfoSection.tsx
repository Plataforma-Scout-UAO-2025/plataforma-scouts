import type { MemberBasicInfo } from "@/types/guardian.type";

interface PersonalInfoSectionProps {
  member: MemberBasicInfo;
}

export default function PersonalInfoSection({ member }: PersonalInfoSectionProps) {


  const getAge = (birthDate?: string): string => {
    if (!birthDate) return "N/A";
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Obtener la edad usando la misma lógica que la tabla
  const memberRec = member as MemberBasicInfo & { birth_date?: string; birthDate?: string; age?: string };
  const birthDate = memberRec.birth_date || memberRec.birthDate;
  const displayAge = memberRec.age || getAge(birthDate);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        Información Personal
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Nombre completo</label>
          <p className="text-gray-900 font-medium">
            {member.first_name} {member.last_name}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Edad</label>
          <p className="text-gray-900">{displayAge}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Identificación</label>
          <p className="text-gray-900">{member.identification || "No especificado"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Tipo de documento</label>
          <p className="text-gray-900">{member.document_type || "No especificado"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p className="text-gray-900">{member.email || "No especificado"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Teléfono</label>
          <p className="text-gray-900">{member.phone || "No especificado"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Género</label>
          <p className="text-gray-900">{member.gender || "No especificado"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Fecha de nacimiento</label>
          <p className="text-gray-900">{birthDate || "No especificado"}</p>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-500">Dirección</label>
          <p className="text-gray-900">{member.address || "No especificado"}</p>
        </div>
      </div>
    </div>
  );
}