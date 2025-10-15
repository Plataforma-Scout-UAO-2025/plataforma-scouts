import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Input,
} from "@/components/ui/index";
import { useMembersManagement } from "@/hooks/useMembersManagement";
import { ChevronDown, ChevronUp, BrushCleaning } from "lucide-react";

interface MembersFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  branchFilter: string;
  setBranchFilter: (value: string) => void;
}

const MembersFilter = ({
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  branchFilter,
  setBranchFilter,
}: MembersFilterProps) => {
  const [isActive, setIsActive] = useState(false);
  const { filteredMembers, extractSectionsFromMember } = useMembersManagement();

  // Extraer nombres de ramas únicos desde los miembros para evitar duplicados
  

  const branches = Array.from(
    new Set(filteredMembers.flatMap((m) => extractSectionsFromMember(m)))
  );

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
            {statusFilter || "Seleccionar Estado..."}{" "}
            {isActive ? <ChevronUp /> : <ChevronDown />}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setStatusFilter("")}
            >
              Todos los estados
            </DropdownMenuItem>
            {["Activo", "Inactivo"].map((status) => (
              <DropdownMenuItem
                key={status}
                className="cursor-pointer"
                onSelect={() => setStatusFilter(status)}
              >
                {status}
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
            {branches.map((b) => (
              <DropdownMenuItem
                key={b}
                className="cursor-pointer"
                onSelect={() => setBranchFilter(b)}
              >
                {b}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-4 justify-end">
        <Button
          variant="primary"
          className="flex h-auto px-3"
          onClick={() => {
            setSearchFilter("");
            setStatusFilter("");
            setBranchFilter("");
          }}
        >
          <BrushCleaning /> Limpiar
        </Button>
      </div>
    </>
  );
};

export default MembersFilter;
