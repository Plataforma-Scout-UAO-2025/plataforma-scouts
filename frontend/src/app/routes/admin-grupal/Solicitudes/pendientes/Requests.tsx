import { useState } from "react";
import { Button } from "@/components/ui/index";
import RequestsFilter from "./components/RequestsFilter";
import RequestsTable from "./components/RequestsTable";
import MemberDetailsModal from "../detalles/MemberDetailsModal";
import RejectModal from "./components/RejectModal";
import ConfirmModal from "./components/ConfirmModal";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";
import { useAuth0ApiWrapper } from "@/hooks/useAuth0ApiWrapper";
import type { Member } from "@/types/member.type";

const Requests = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const {
    orgId,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth0ApiWrapper();

  const { members, total, page, totalPages, setPage, loading, error, refetch } =
    useTenantMembersByStatus({
      status: "PENDING",
      pageSize: 10,
      search: searchFilter,
      city: cityFilter,
    });

  const startIdx = total === 0 ? 0 : (page - 1) * 10 + 1;
  const endIdx = Math.min(page * 10, total);

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setOpenViewModal(true);
  };

  const handleRejectFromModal = () => {
    setOpenViewModal(false);
    setOpenRejectModal(true);
  };

  const handleSuccess = async () => {
    await refetch();
  };

  const handleRejectSuccess = () => {
    setSelectedMember(null);
    setOpenConfirmModal(true);
    refetch();
  };

  // Loading states
  if (authLoading) {
    return (
      <div className="mx-4 flex justify-center items-center h-screen">
        <p>Cargando autenticación...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-4 flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">No estás autenticado</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (!orgId) {
    return (
      <div className="mx-4 flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">
            No se pudo obtener la información de tu organización
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Solicitudes</p>
        <p className="text-2xl text-text font-medium my-5">
          Aquí se mostrarán las solicitudes pendientes.
        </p>
      </header>

      {/* Filtros */}
      <section className="my-8 flex justify-between flex-col md:flex-row gap-4 md:gap-6">
        <RequestsFilter
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
        />
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={loading}
          className="px-4"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </Button>
      </section>

      {/* Tabla */}
      <section className="mt-6 space-y-4">
        {error && <p className="text-red-600">{error}</p>}

        <RequestsTable
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
        onReject={handleRejectFromModal}
      />

      <RejectModal
        open={openRejectModal}
        onOpenChange={setOpenRejectModal}
        member={selectedMember}
        onSuccess={handleRejectSuccess}
      />

      <ConfirmModal
        open={openConfirmModal}
        onOpenChange={setOpenConfirmModal}
        title="Solicitud procesada"
        message="La solicitud ha sido rechazada correctamente."
      />
    </div>
  );
};

export default Requests;
