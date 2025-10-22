import { Button } from "@/components/ui/index";
import BranchCount from "./components/BranchCount";
import MembersFilter from "./components/MembersFilter";
import MembersTable from "./components/MembersTable";
import { useNavigate } from "react-router-dom";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";
import { useMemberFilters } from "@/hooks/useMemberFilters";

const Miembros = () => {
  const {
    searchFilter,
    setSearchFilter,
    isActiveFilter,
    setIsActiveFilter,
    branchFilter,
    setBranchFilter,
    filteredMembers,
    paginatedMembers,
    totalMembers,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,
    branchMembers,
  } = useMemberFilters({ itemsPerPage: 10 });

  const { loading, error } = useTenantMembersByStatus({
    status: "APPROVED",
  });
  const navigate = useNavigate();

  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">
          Gestión de Miembros Aprobados
        </p>
      </header>
      <section className="my-2 flex gap-4">
        <BranchCount
          filteredMembers={filteredMembers}
          totalMembers={totalMembers}
        />
      </section>

      {/* Filtros */}
      <section className="my-8 flex justify-between flex-col md:flex-row gap-4 md:gap-6">
        <MembersFilter
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          isActiveFilter={isActiveFilter}
          setIsActiveFilter={setIsActiveFilter}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          filteredMembers={filteredMembers}
          branchMembers={branchMembers}
        />
      </section>

      {/* Tabla */}
      <section className="mt-6">
        {loading && <p>Cargando miembros…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <MembersTable filteredMembers={paginatedMembers} />
        )}

        {/* Footer paginación */}
        <section className="flex justify-between items-center mt-4">
          <div className="flex justify-start mt-3 gap-2">
            <Button
              variant="primary"
              onClick={() => navigate("/app/solicitudes")}
            >
              Solicitudes
            </Button>
            <p className="text-sm text-text self-center ml-4">
              Mostrando {startIndex + 1}-
              {Math.min(endIndex, filteredMembers.length)} de{" "}
              {filteredMembers.length} miembros
            </p>
          </div>

          <div className="flex justify-end mt-3 gap-2 items-center">
            <p className="text-sm text-text mr-2">
              Página {currentPage} de {totalPages || 1}
            </p>
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Siguiente
            </Button>
          </div>
        </section>
      </section>
    </div>
  );
};
export default Miembros;
