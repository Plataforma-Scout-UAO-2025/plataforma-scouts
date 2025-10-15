import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/index";
import BranchCount from "./components/BranchCount";
import MembersFilter from "./components/MembersFilter";
import MembersTable from "./components/MembersTable";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";

const TeamMembers = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const navigate = useNavigate();

  const { members, total, page, totalPages, setPage, loading, error } =
    useTenantMembersByStatus({
      status: "APPROVED",
      pageSize: 10,
      search: searchFilter,
      city: cityFilter,
      branch: branchFilter,
    });

  const startIdx = total === 0 ? 0 : (page - 1) * 10 + 1;
  const endIdx = Math.min(page * 10, total);

  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">Gestión de Miembros</p>
      </header>
      <section className="my-2 flex gap-4">
        <BranchCount />
      </section>

      {/* Filtros */}
      <section className="my-8 flex justify-between flex-col md:flex-row gap-4 md:gap-6">
        <MembersFilter
          searchFilter={searchFilter}
          setSearchFilter={setSearchFilter}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
        />
      </section>

      {/* Tabla */}
      <section className="mt-6">
        {loading && <p>Cargando miembros…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && <MembersTable filteredMembers={members} />}

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
    </div>
  );
};

export default TeamMembers;
