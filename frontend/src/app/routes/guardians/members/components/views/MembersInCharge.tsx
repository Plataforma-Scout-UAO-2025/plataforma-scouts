import { Button } from "@/components/ui/index";
import { useNavigate } from "react-router-dom";
import { useMembersInChargeOf } from "@/hooks/useMembersInChargeOf";
import GuardianMembersTable from "../tables/GuardianMembersTable";

const MembersInCharge = () => {
  // Pasar el guardianId al hook y eliminar dispatch duplicado
  const { members, loading, error } = useMembersInChargeOf(309);
  const navigate = useNavigate();
  
  console.log("members from hook:", members);
  console.log("loading:", loading);
  console.log("error:", error);

  if (loading) {
    return <div>Cargando miembros...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const totalMembers = members.length;

  return (
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
          <GuardianMembersTable filteredMembers={members} />
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
  );
};

export default MembersInCharge;