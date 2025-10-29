
import { Button, Input } from "@/components/ui/index";
import { BrushCleaning } from "lucide-react";

interface RejectedFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  phoneFilter: string;
  setPhoneFilter: (value: string) => void;
}

const RejectedFilter = ({
  searchFilter,
  setSearchFilter,
  phoneFilter,
  setPhoneFilter,
}: RejectedFilterProps) => {
  return (
    <div className="flex w-full gap-4">
      <Input
        type="text"
        placeholder="Buscar nombre, correo o ID..."
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        className="w-1/2 flex h-auto border-primary"
      />
      <Input
        type="text"
        placeholder="Buscar teléfono..."
        value={phoneFilter}
        onChange={(e) => setPhoneFilter(e.target.value)}
        className="w-1/2 flex h-auto border-primary"
      />
      <Button
        variant="primary"
        className="flex h-auto px-3"
        onClick={() => {
          setSearchFilter("");
          setPhoneFilter("");
        }}
      >
        <BrushCleaning /> Limpiar
      </Button>
    </div>
  );
};

export default RejectedFilter;
