import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/index";
import BranchCount from "./components/BranchCount";
import MembersFilter from "./components/MembersFilter";
import MembersTable from "./components/MembersTable";
import { useMembers } from "../../../../hooks/useMembers";
import type { Member } from "./types/member.type";

const Miembros = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const { members, loading, error, message, loadMembers, clearMessages } =
    useMembers();

  useEffect(() => {
    loadMembers({ status: "ACCEPTED" });
  }, [loadMembers]);

  // Filtrado local
  const filteredMembers = useMemo(() => {
    if (!members || members.length === 0) return [];
    return members.filter((member: Member) => {
      const matchesSearch =
        !searchFilter ||
        member.first_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.identification
          .toLowerCase()
          .includes(searchFilter.toLowerCase());

      const matchesCity =
        !cityFilter ||
        (member.city &&
          member.city.toLowerCase().includes(cityFilter.toLowerCase()));

      return matchesSearch && matchesCity;
    });
  }, [members, searchFilter, cityFilter]);

  // Limpiar mensajes de notificación
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => clearMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, clearMessages]);

  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">Gestión de Miembros</p>
        <p className="text-2xl font-bold text-secondary">Centinelas 113</p>
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
        />
      </section>

      {/* Tabla */}
      <section className="mt-6">
        <MembersTable filteredMembers={filteredMembers} loading={loading} />

        <section className="flex justify-between items-center mt-4">
          <div className="flex justify-start mt-3 gap-2">
            <Button variant="primary">Solicitudes</Button>
            <p className="text-sm text-text self-center ml-4">
              Mostrando {filteredMembers.length} de {members.length} miembros
            </p>
          </div>

          <div className="flex justify-end mt-3 gap-2">
            <Button variant="outline">Anterior</Button>
            <Button variant="outline">Siguiente</Button>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Miembros;
