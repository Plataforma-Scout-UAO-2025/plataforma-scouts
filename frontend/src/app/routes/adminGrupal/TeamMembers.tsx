import { useState, useMemo } from "react";
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/index";
import {
  Pencil,
  Trash,
  ChevronDown,
  ChevronUp,
  BrushCleaning,
  Plus,
  User,
  Medal,
} from "lucide-react";
import { membersData, branchCounts, cities } from "../../../lib/mockObjects";

const TeamMembers = () => {
  const [isActive, setIsActive] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const filteredMembers = useMemo(() => {
    return membersData.filter((member) => {
      const matchesSearch =
        searchFilter === "" ||
        member.firstName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        member.identification
          .toLowerCase()
          .includes(searchFilter.toLowerCase()) ||
        member.branch.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCity =
        cityFilter === "" ||
        member.city.toLowerCase() === cityFilter.toLowerCase();

      return matchesSearch && matchesCity;
    });
  }, [searchFilter, cityFilter]);

  return (
    <div className="mx-4">
      <header className="flex items-center mb-4 justify-between">
        <p className="text-5xl font-bold text-primary">Gestión de Miembros</p>
        <p className="text-2xl font-bold text-secondary">Centinelas 113</p>
      </header>
      <section className="my-2 flex gap-4">
        {branchCounts.map((item) => (
          <div
            className={`bg-accent rounded-xl shadow-md p-3 flex items-center gap-3 w-1/5`}
          >
            <div className="p-3">
              <p className="text-sm md:text-lg text-primary mb-2">
                {item.value}
              </p>
              <p className="text-sm md:text-lg text-text font-bold">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Filtros de búsqueda */}
      <section className="my-8 flex justify-between flex-col md:flex-row gap-4 md:gap-6">
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
              {cityFilter || "Seleccionar Ciudad..."}{" "}
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
        <div className="flex gap-4 justify-end">
          <Button variant="primary">
            <Plus />
            Crear Nuevo Integrante
          </Button>
        </div>
      </section>

      {/* Tabla de miembros */}
      <section className="mt-6">
        <div className="border-3 border-primary rounded-lg overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="text-primary">
              <TableRow className="border-b border-primary hover:bg-transparent">
                <TableHead className="pl-4 font-bold text-primary">
                  Id
                </TableHead>
                <TableHead className="font-bold text-primary">
                  Nombres
                </TableHead>
                <TableHead className="font-bold text-primary">
                  Apellidos
                </TableHead>
                <TableHead className="font-bold text-primary">
                  Identificación
                </TableHead>
                <TableHead className="font-bold text-primary">Creado</TableHead>
                <TableHead className="font-bold text-primary">Estado</TableHead>
                <TableHead className="font-bold text-primary">Ciudad</TableHead>
                <TableHead className="font-bold text-primary">Rama</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id} className="border-primary">
                    <TableCell className="pl-4 font-medium">
                      {member.id}
                    </TableCell>
                    <TableCell>{member.firstName}</TableCell>
                    <TableCell>{member.lastName}</TableCell>
                    <TableCell>{member.identification}</TableCell>
                    <TableCell>{member.createdAt}</TableCell>
                    <TableCell>{member.status}</TableCell>
                    <TableCell>{member.city}</TableCell>
                    <TableCell>{member.branch}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="iconbutton" size="icon">
                        <User />
                      </Button>
                      <Button variant="iconbutton" size="icon">
                        <Medal />
                      </Button>
                      <Button
                        variant="iconbutton"
                        size="icon"
                        className="text-secondary hover:text-blue-800"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="iconbutton"
                        size="icon"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <p className="text-text text-lg">
                      No se encontraron miembros que coincidan con los filtros.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <section className="flex justify-between items-center mt-4">
          <div className="flex justify-start mt-3 gap-2">
            <Button variant="primary">Solicitudes</Button>
            <p className="text-sm text-text self-center ml-4">
              Mostrando {filteredMembers.length} de {membersData.length}{" "}
              miembros
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
