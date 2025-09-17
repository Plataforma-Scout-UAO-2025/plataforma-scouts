import { useState, useMemo } from "react";
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
import { eventsData, cities } from "../../../lib/mockObjects";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Events = () => {
  const [isActive, setIsActive] = useState(false);
  const [date, setDate] = useState<Date>();
  const [nameFilter, setNameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const matchesName =
        nameFilter === "" ||
        event.name.toLowerCase().includes(nameFilter.toLowerCase());

      const matchesLocation =
        locationFilter === "" ||
        event.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesDate = !date || event.date === format(date, "dd/MM/yyyy");

      return matchesName && matchesLocation && matchesDate;
    });
  }, [nameFilter, locationFilter, date]);

  return (
    <div className="mx-4">
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
            onClick={() => {
              setNameFilter("");
              setLocationFilter("");
              setDate(undefined);
            }}
          >
            Limpiar
          </Button>
        </div>
      </section>
      <section className="flex flex-col md:flex-row">
        <div className="w-full h-auto mt-4">
          <p className="text-2xl text-primary mx-10 my-5">
            Próximos eventos ({filteredEvents.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-10">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-accent rounded-xl shadow-md p-6"
                >
                  <div className="flex mb-4">
                    <div>
                      <p className="text-lg text-text font-bold mb-2">
                        Nombre del evento: {event.name}
                      </p>
                      <p className="text-sm text-primary mb-1">
                        Evento #{event.id}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-text">
                      <span className="font-medium">Lugar del evento:</span>{" "}
                      {event.location}
                    </p>
                    <p className="text-sm text-text">
                      <span className="font-medium">Hora de inicio:</span>{" "}
                      {event.startTime}
                    </p>
                    <p className="text-sm text-text">
                      <span className="font-medium">Fecha del evento:</span>{" "}
                      {event.date}
                    </p>
                  </div>
                  <Button variant="primary" className="mt-3">
                    Inscribirme
                  </Button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron eventos que coincidan con los filtros.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
