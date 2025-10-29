import {
  Button,
  Input,
} from "@/components/ui/index";
import { BrushCleaning } from "lucide-react";

interface RequestsFilterProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  cityFilter: string;
  setCityFilter: (value: string) => void;
}

const RequestsFilter = ({
  searchFilter,
  setSearchFilter,
}: RequestsFilterProps) => {

  return (
    <>
      <div className="flex w-2/3 gap-4">
        <Input
          type="text"
          placeholder="Buscar..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="w-2/5 flex h-auto border-primary"
        />
        <Button
          variant="primary"
          className="w-1/6 flex h-auto px-3"
          onClick={() => {
            setSearchFilter("");
          }}
        >
          <BrushCleaning /> Limpiar
        </Button>
      </div>
    </>
  );
};

export default RequestsFilter;
