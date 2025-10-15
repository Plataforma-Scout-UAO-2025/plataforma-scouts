import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Button,
  Input,
} from "@/components/ui/index";
import { ChevronDown, ChevronUp, BrushCleaning } from "lucide-react";
import { useTenantMembersByStatus } from "@/hooks/useTenantMembersByStatus";

interface RejectedFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
}

const RejectedFilter = ({
  searchFilter,
  setSearchFilter,
  cityFilter,
  setCityFilter,
}: RejectedFilterProps) => {
  const [isActive, setIsActive] = useState(false);
  const members = useTenantMembersByStatus({ status: "REJECTED" }).members;
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
        <Button
          variant="primary"
          className="w-1/6 flex h-auto px-3"
          onClick={() => {
            setSearchFilter("");
            setCityFilter("");
          }}
        >
          <BrushCleaning /> Limpiar
        </Button>
      </div>
    </>
  );
};

export default RejectedFilter;
