import { useState } from "react";
import { Button } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useMembersInChargeOf } from "@/hooks/useMembersInChargeOf";
import GuardianMembersTable from "../tables/GuardianMembersTable";
import MemberDetailsSheet from "../modals/MemberDetailsSheet";
import type { MemberBasicInfo } from "@/types/guardian.type";

const MembersInCharge = () => {
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberBasicInfo | null>(null);

  // Agregar esta línea que faltaba
  const { user } = useAuth0();
  console.log("Usuario completo:", user);
  console.log("user.sub:", user?.sub);

  
  // Pasar el guardianId al hook y eliminar dispatch duplicado
  const guardianId = user?.sub ? parseInt(user.sub.replace('auth0|', '')) : undefined;
  console.log("Guardian ID calculado:", guardianId);
  const { members, loading, error } = useMembersInChargeOf(guardianId);
  const navigate = useNavigate();

  const handleViewMember = (member: MemberBasicInfo) => {
    setSelectedMember(member);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
    return <div>Cargando miembros...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalMembers = members.length;

  return (
    <>
      <div className="mx-4">
        <header className="flex items-center mb-4 justify-between">
          <p className="text-5xl font-bold text-primary">
            Miembros a Cargo
          </p>
        </header>

        {/* Tabla */}
        <section className="mt-6">
          {loading && <p>Cargando miembros…</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && !error && (
            <GuardianMembersTable 
              filteredMembers={members} 
              onViewMember={handleViewMember}
            />
          )}

          {/* Footer simple */}
          <section className="flex justify-between items-center mt-4">
            <div className="flex justify-start mt-3 gap-2">
              <Button
                variant="primary"
                onClick={() => navigate("/app/guardians/profile")}
              >
                Mi Perfil
              </Button>
              <p className="text-sm text-text self-center ml-4">
                Mostrando {totalMembers} miembros
              </p>
            </div>
          </section>
        </section>
      </div>

      {/* Modal de detalles del miembro */}
      <MemberDetailsSheet
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        member={selectedMember}
      />
    </>
  );
};

export default MembersInCharge;