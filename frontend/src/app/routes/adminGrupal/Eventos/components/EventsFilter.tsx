import { useState } from "react";
import {
  Label,
  Input,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/index";
import { ChevronDown, ChevronUp, CalendarIcon } from "lucide-react";
import { cities } from "@/lib/mockObjects";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EventsFilterProps {
  nameFilter: string;
  setNameFilter: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const EventsFilter = ({
  nameFilter,
  setNameFilter,
  locationFilter,
  setLocationFilter,
  date,
  setDate,
}: EventsFilterProps) => {
  const [isActive, setIsActive] = useState(false);

  const clearFilters = () => {
    setNameFilter("");
    setLocationFilter("");
    setDate(undefined);
  };

  return (
    <>
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Gestión de Eventos</p>
        <p className="text-2xl text-text mx-10 my-5">Buscar Evento</p>
      </header>
      <section className="mx-10 flex gap-2">
        <div className="flex gap-2 flex-1">
          <div className="flex-1">
            <Label className="mb-2 block font-medium text-text">Nombre</Label>
            <Input
              className="h-9 w-full py-1 px-2 text-sm border-primary"
              placeholder="Ejemplo: Conferencia Anual"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Label className="mb-2 block font-medium text-text">Lugar</Label>
            <DropdownMenu onOpenChange={setIsActive}>
              <DropdownMenuTrigger className="py-1 px-2 h-9 text-sm border border-primary rounded-md justify-between flex items-center w-full">
                {locationFilter || "Lugar del Evento..."}{" "}
                {isActive ? <ChevronUp /> : <ChevronDown />}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="py-1 px-2 text-sm border border-primary bg-background rounded-md">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setLocationFilter("")}
                >
                  Todos los lugares
                </DropdownMenuItem>
                {cities.map((city) => (
                  <DropdownMenuItem
                    key={city}
                    className="cursor-pointer"
                    onSelect={() => setLocationFilter(city)}
                  >
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1">
            <Label className="mb-2 block font-medium text-text">Fecha</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 py-1 px-2 text-sm border-primary justify-start text-left font-normal w-full"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "PPP", { locale: es })
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  captionLayout="dropdown"
                  className="bg-background rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex items-end">
          <Button
            variant="primary"
            className="h-9 px-3 flex"
            onClick={clearFilters}
          >
            Limpiar
          </Button>
        </div>
      </section>
    </>
  );
};

export default EventsFilter;