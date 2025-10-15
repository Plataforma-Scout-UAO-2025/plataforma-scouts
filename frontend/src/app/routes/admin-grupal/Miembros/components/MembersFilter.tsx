import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Input,
} from "@/components/ui/index";
import { branches } from "@/lib/mockObjects";
import { ChevronDown, ChevronUp, BrushCleaning, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";

interface MembersFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  branchFilter: string;
  setBranchFilter: (value: string) => void;
}

const MembersFilter = ({
  searchFilter,
  setSearchFilter,
  cityFilter,
  setCityFilter,
  branchFilter,
  setBranchFilter,
}: MembersFilterProps) => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const members = useTenantMembersByStatus({ status: "APPROVED" }).members;
  const cities = useMemo(() => {
    const uniqueCities = [
      ...new Set(members.map((m) => m.address?.split(",")[0]).filter(Boolean)),
    ];
    return uniqueCities.sort();
  }, [members]);
  return (
    <>
      <div className="flex w-2/3 gap-4">
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-2/3 flex h-auto border-primary"
        />
        <DropdownMenu onOpenChange={setIsActive}>
          <DropdownMenuTrigger className="w-3/5 py-1 px-2 text-sm border border-primary rounded-md justify-between flex items-center">
            {cityFilter || "Seleccionar dirección..."}{" "}
            {isActive ? <ChevronUp /> : <ChevronDown />}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setCityFilter("")}
            >
              Todas las direcciones
            </DropdownMenuItem>
            {cities.map((city) => (
              <DropdownMenuItem
                key={city}
                className="cursor-pointer"
                onSelect={() => setCityFilter(city ?? "")}
              >
                {city}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu onOpenChange={setIsActive}>
          <DropdownMenuTrigger className="w-3/5 py-1 px-2 text-sm border border-primary rounded-md justify-between flex items-center">
            {branchFilter || "Seleccionar Rama..."}{" "}
            {isActive ? <ChevronUp /> : <ChevronDown />}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setBranchFilter("")}
            >
              Todas las ramas
            </DropdownMenuItem>
            {branches.map((branch) => (
              <DropdownMenuItem
                key={branch}
                className="cursor-pointer"
                onSelect={() => setBranchFilter(branch)}
              >
                {branch}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="primary"
          className="w-1/6 flex h-auto px-3"
          onClick={() => {
            setSearchFilter("");
            setCityFilter("");
            setBranchFilter("");
          }}
        >
          <BrushCleaning /> Limpiar
        </Button>
      </div>
      <div className="flex gap-4 justify-end">
        <Button variant="primary" onClick={() => {navigate("/app/inscripcion")}}>
          <Plus />
          Crear Nuevo Integrante
        </Button>
      </div>
    </>
  );
};

export default MembersFilter;
