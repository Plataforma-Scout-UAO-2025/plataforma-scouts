import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/index";
import BranchCount from "./components/BranchCount";
import MembersFilter from "./components/MembersFilter";
import MembersTable from "./components/MembersTable";
import type { Member } from "@/types/member.type";
import { useMember } from "@/hooks/useMember";
import { fetchMembersAction } from "@/store/members/membersActions";
import { clearNotification } from "@/store/members/membersSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

const TeamMembers = () => {
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { members, error, message } = useMember();

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(fetchMembersAction());
  }, [dispatch]);

  // Aplicar filtros y mapear a formato de tabla
  const filteredMembers = useMemo(() => {
    if (!members || !members.length) return [];

    const filtered = members.filter((member: Member) => {
      const matchesSearch =
        searchFilter === "" ||
        member.first_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.last_name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.identification
          ?.toLowerCase()
          .includes(searchFilter.toLowerCase());

      const matchesCity =
        cityFilter === "" ||
        member.address?.toLowerCase().includes(cityFilter.toLowerCase());

      const matchesBranch =
        branchFilter === "" ||
        member.branch?.some((branch) =>
          branch.name.toLowerCase().includes(branchFilter.toLowerCase())
        );

      return matchesSearch && matchesCity && matchesBranch;
    });

    // Mapear a formato de tabla
    return filtered.map((member: Member): Member => ({
      ...member,
    }));
  }, [members, searchFilter, cityFilter, branchFilter]);

  // Limpiar mensajes después de mostrarlos
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        dispatch(clearNotification());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error, dispatch]);

  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">Gestión de Miembros</p>
        {/* <p className="text-2xl font-bold text-secondary">Centinelas 113</p> */}
      </header>
      <section className="my-2 flex gap-4">
        <BranchCount />
      </section>

      {/* Filtros de búsqueda */}
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

      {/* Tabla de miembros */}
      <section className="mt-6">
        <MembersTable filteredMembers={filteredMembers} />
        <section className="flex justify-between items-center mt-4">
          <div className="flex justify-start mt-3 gap-2">
            <Button variant="primary" onClick={() => {navigate("/solicitudes")}}>Solicitudes</Button>
            <p className="text-sm text-text self-center ml-4">
              Mostrando {filteredMembers.length} de {members?.length || 0} miembros
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

export default TeamMembers;
