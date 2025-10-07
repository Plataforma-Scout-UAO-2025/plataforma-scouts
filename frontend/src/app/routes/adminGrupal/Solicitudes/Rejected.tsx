import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, BrushCleaning, Eye } from "lucide-react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/index";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Member } from "@/models/types/memberTypes";
import { getMembersByStatus, getMember } from "@/api/membersApi";

const Rejected = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isActive, setIsActive] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    ACCEPTED: "Aceptado",
    NOT_ACCEPTED: "Rechazado",
  };

  //Cargar miembros rechazados
  const loadRejectedMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembersByStatus("NOT_ACCEPTED");
      setMembers(data);
    } catch (error) {
      console.error("Error al cargar miembros rechazados:", error);
      alert("Error al cargar las solicitudes rechazadas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRejectedMembers();
  }, []);

  // Ciudades
  const cities = useMemo(() => {
    const uniqueCities = [
      ...new Set(members.map((m) => m.address?.split(",")[0]).filter(Boolean)),
    ];
    return uniqueCities.sort();
  }, [members]);

  // Filtros
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const matchesSearch =
        searchFilter === "" ||
        fullName.includes(searchFilter.toLowerCase()) ||
        member.identification?.toString().includes(searchFilter.toLowerCase());

      const matchesCity =
        cityFilter === "" ||
        member.address?.toLowerCase().includes(cityFilter.toLowerCase());

      return matchesSearch && matchesCity;
    });
  }, [members, searchFilter, cityFilter]);

  // Ver detalles de un miembro
  const handleView = async (member: Member) => {
    try {
      setLoading(true);
      if (member.member_id === undefined) {
        throw new Error("El ID del miembro es indefinido.");
      }
      const data = await getMember(member.member_id);
      setSelectedMember(data);
      setOpenViewModal(true);
    } catch (err) {
      console.error("Error al cargar datos del miembro:", err);
      alert("Error al cargar los detalles del miembro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">
          Solicitudes Rechazadas
        </p>
        <p className="text-2xl text-text font-medium my-5">
          Aquí se mostrarán las solicitudes rechazadas.
        </p>
      </header>

      {/* Filtros */}
      <section className="my-8 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex w-full md:w-2/3 gap-4">
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
            <BrushCleaning size={16} /> Limpiar
          </Button>
        </div>
      </section>

      {/* Tabla */}
      <section className="mt-6 space-y-4">
        <div className="border-3 border-primary rounded-lg overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="text-primary">
              <TableRow className="border-b border-primary">
                <TableHead className="pl-4 font-bold">Id</TableHead>
                <TableHead className="font-bold">Nombres</TableHead>
                <TableHead className="font-bold">Apellidos</TableHead>
                <TableHead className="font-bold">Identificación</TableHead>
                <TableHead className="font-bold">Ciudad</TableHead>
                <TableHead className="font-bold">Estado</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.member_id}>
                    <TableCell>{member.member_id}</TableCell>
                    <TableCell>{member.first_name}</TableCell>
                    <TableCell>{member.last_name}</TableCell>
                    <TableCell>{member.identification}</TableCell>
                    <TableCell>
                      {member.address?.split(",")[0] || "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className="py-1 rounded font-medium bg-red-100 text-red-800">
                        {statusLabels[member.status ?? "Rechazado"]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="primary"
                        size="icon"
                        onClick={() => handleView(member)}
                      >
                        <Eye size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron solicitudes rechazadas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Modal detalles */}
      <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del miembro rechazado</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            selectedMember && (
              <div className="space-y-2 text-sm">
                <p>
                  <b>Nombres:</b> {selectedMember.first_name}
                </p>
                <p>
                  <b>Apellidos:</b> {selectedMember.last_name}
                </p>
                <p>
                  <b>Correo:</b> {selectedMember.email}
                </p>
                <p>
                  <b>Documento:</b> {selectedMember.document_type}{" "}
                  {selectedMember.identification}
                </p>
                <p>
                  <b>Dirección:</b> {selectedMember.address}
                </p>
                <p>
                  <b>Teléfono:</b> {selectedMember.phone}
                </p>
                <p>
                  <b>Sexo:</b> {selectedMember.gender}
                </p>
                <p>
                  <b>Estado:</b>{" "}
                  <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                    {statusLabels[selectedMember.status ?? "Rechazado"]}
                  </span>
                </p>
              </div>
            )
          )}
          <DialogFooter>
            <Button onClick={() => setOpenViewModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rejected;
