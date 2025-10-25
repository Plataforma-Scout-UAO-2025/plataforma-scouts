import { useState } from "react";
import { Button } from "@/components/ui/index";
import RejectedFilter from "./components/RejectedFilter";
import RejectedTable from "./components/RejectedTable";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";

const Rejected = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const {
    members,
    total,
    page,
    totalPages,
    setPage,
    loading,
    error,
  } = useTenantMembersByStatus({
    status: "REJECTED",
    pageSize: 10,
    search: searchFilter,
    city: cityFilter,
  });

  const startIdx = total === 0 ? 0 : (page - 1) * 10 + 1;
  const endIdx = Math.min(page * 10, total);

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
        {loading && <p>Cargando miembros…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && <RejectedTable filteredMembers={members} />}

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
    </div>
  );
};

export default Rejected;
