import { useState } from "react";
import { Button } from "@/components/ui/index";
import RejectedFilter from "./components/RejectedFilter";
import RejectedTable from "./components/RejectedTable";
import MemberDetailsModal from "../detalles/MemberDetailsModal";
import ConfirmModal from "../pendientes/components/ConfirmModal";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";
import type { Member } from "@/types/member.type";

const Rejected = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const {
    members,
    total,
    page,
    totalPages,
    setPage,
    loading,
    error,
    refetch
  } = useTenantMembersByStatus({
    status: "REJECTED",
    pageSize: 10,
    search: searchFilter,
    city: cityFilter,
  });

  const { orgId } = useAuth0ApiWrapper();

  const startIdx = total === 0 ? 0 : (page - 1) * 10 + 1;
  const endIdx = Math.min(page * 10, total);

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setOpenViewModal(true);
  };

  const handleSuccess = async () => {
    setOpenViewModal(false);
    setOpenConfirmModal(true);
    await refetch();
  };

  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Solicitudes Rechazadas</p>
        <p className="text-2xl text-text font-medium my-5">
          Aquí se mostrarán las solicitudes rechazadas.
        </p>
      </header>

      {/* Filtros */}
      <section className="my-8 flex justify-between flex-col md:flex-row gap-4 md:gap-6">
        <RejectedFilter
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
        />
      </section>

      {/* Tabla */}
      <section className="mt-6">
        {error && <p className="text-red-600">{error}</p>}

        <RejectedTable 
          filteredMembers={members}
          onViewMember={handleViewMember}
          loading={loading}
        />

        {/* Footer paginación */}
        <section className="flex justify-between items-center mt-4">
          <div className="flex justify-start mt-3 gap-2">
            <p className="text-sm text-text self-center ml-4">
              Mostrando {startIdx}–{endIdx} de {total} miembros
            </p>
          </div>

          <div className="flex justify-end mt-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || loading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || loading}
            >
              Siguiente
            </Button>
          </div>
        </section>
      </section>

      {/* Modales */}
      <MemberDetailsModal
        open={openViewModal}
        onOpenChange={setOpenViewModal}
        member={selectedMember}
        orgId={orgId || ""}
        onSuccess={handleSuccess}
        showRejectButton={false}
      />

      <ConfirmModal
        open={openConfirmModal}
        onOpenChange={setOpenConfirmModal}
        title="Solicitud Aceptada"
        message="La solicitud ha sido aceptada correctamente."
      />
    </div>
  );
};

export default Rejected;
