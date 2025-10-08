import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Input,
} from "@/components/ui/index";
import { ChevronDown, ChevronUp, BrushCleaning, Plus } from "lucide-react";
import { useState } from "react";

interface MembersFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
  cities?: string[];
}

const MembersFilter = ({
  searchFilter,
  setSearchFilter,
  cityFilter,
  setCityFilter,
  cities = [],
}: MembersFilterProps) => {
  const [isActive, setIsActive] = useState(false);

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
          <DropdownMenuTrigger className="w-1/3 py-1 px-2 text-sm border border-primary rounded-md justify-between flex items-center">
            {cityFilter || "Seleccionar Ciudad..."}
            {isActive ? <ChevronUp /> : <ChevronDown />}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setCityFilter("")}
            >
              Todas las ciudades
            </DropdownMenuItem>
            {cities.map((city) => (
              <DropdownMenuItem
                key={city}
                className="cursor-pointer"
                onSelect={() => setCityFilter(city)}
              >
                {city}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <Button
          variant="primary"
          className="w-1/6 flex h-auto px-3"
          onClick={() => {
            setSearchFilter("");
            setCityFilter("");
          }}
        >
          <BrushCleaning /> Limpiar
        </Button> */}
      </div>

      <div className="flex gap-4 justify-end">
        {/* <Button variant="primary">
          <Plus /> Crear Nuevo Integrante
        </Button> */}
      </div>
    </>
  );
};

export default MembersFilter;
