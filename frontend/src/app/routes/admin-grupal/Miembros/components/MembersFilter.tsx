import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Input,
} from "@/components/ui/index";
import { ChevronDown, ChevronUp, BrushCleaning } from "lucide-react";
import type { Member } from "@/types/member.type";

interface MembersFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  isActiveFilter: string;
  setIsActiveFilter: (value: string) => void;
  branchFilter: string;
  setBranchFilter: (value: string) => void;
  filteredMembers: Member[];
  extractSectionsFromMember: (member: Member) => string[];
}

const MembersFilter = ({
  searchFilter,
  setSearchFilter,
  isActiveFilter,
  setIsActiveFilter,
  branchFilter,
  setBranchFilter,
  filteredMembers,
  extractSectionsFromMember,
}: MembersFilterProps) => {
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const branches = Array.from(
    new Set(filteredMembers.flatMap((m) => extractSectionsFromMember(m)))
  );

  // Roles de ejemplo
  const roles = ["Scout", "Tesorero", "Acudiente", "Scouter", "Comite Admin"];

  // Rutas según el rol seleccionado
  const roleRoutes: Record<string, string> = {
    Scout: "/app/inscripcion",
    Tesorero: "/app/inscripcion/tesorero",
    Acudiente: "/app/inscripcion/acudiente",
    Scouter: "/app/inscripcion/scouter",
    "Comite Admin": "/app/inscripcion/comite-admin",
  };

  // Manejar selección de rol
  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    if (roleRoutes[role]) {
      navigate(roleRoutes[role]);
    }
  };

  return (
    <>
      {/* Filtros principales */}
      <div className="flex w-2/3 gap-4 justify-end">
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-2/3 h-10 border-primary"
        />

        {/* Filtro por estado */}
        <DropdownMenu onOpenChange={setIsActive}>
          <DropdownMenuTrigger className="w-3/5 h-10 px-3 text-sm border border-primary rounded-md justify-between flex items-center">
            {isActiveFilter || "Seleccionar Estado..."}{" "}
            {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setIsActiveFilter("")}
            >
              Todos los estados
            </DropdownMenuItem>
            {["Activo", "Inactivo"].map((status) => (
              <DropdownMenuItem
                key={status}
                className="cursor-pointer"
                onSelect={() => setIsActiveFilter(status)}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtro por rama */}
        <DropdownMenu onOpenChange={setIsActive}>
          <DropdownMenuTrigger className="w-3/5 h-10 px-3 text-sm border border-primary rounded-md justify-between flex items-center">
            {branchFilter || "Seleccionar Rama..."}{" "}
            {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
      
      <div className="flex gap-4">
        {/* Desplegable de roles para crear nuevo integrante */}
        <DropdownMenu onOpenChange={setIsRoleMenuOpen}>
          <DropdownMenuTrigger className="h-10 px-3 text-sm border bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 rounded-md justify-between flex items-center">
            {selectedRole || "Crear Nuevo Integrante..."}{" "}
            {isRoleMenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setSelectedRole("")}
            >
            </DropdownMenuItem>
            {roles.map((role) => (
              <DropdownMenuItem
                key={role}
                className="cursor-pointer"
                onSelect={() => handleSelectRole(role)}
              >
                {role}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Botón limpiar */}
        <Button
          variant="primary"
          className="h-10 px-3 flex items-center gap-2"
          onClick={() => {
            setSearchFilter("");
            setIsActiveFilter("");
            setBranchFilter("");
            setSelectedRole("");
          }}
        >
          <BrushCleaning className="h-4 w-4" /> Limpiar
        </Button>
      </div>
    </>
  );
};

export default MembersFilter;