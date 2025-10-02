import { useState, useMemo, useEffect } from "react";
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
import { Eye, ChevronDown, ChevronUp, BrushCleaning } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  identification: string;
  document_type: string;
  birth_date: string;
  address: string;
  phone: string;
  gender: string;
  weight: string;
  height: string;
  hobbies: string;
  sports: string;
  instruments: string;
  status: string;
}

const Requests = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Filtros
  const [isActive, setIsActive] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    cargarMiembros();
  }, []);

  const cargarMiembros = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:8081/api/members/list_members_by_status?status=PENDING",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar los miembros");
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error("Error al cargar miembros:", error);
      alert("Error al cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const cities = useMemo(() => {
    const uniqueCities = [...new Set(members.map((m) => m.address?.split(",")[0]).filter(Boolean))];
    return uniqueCities.sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const matchesSearch =
        searchFilter === "" ||
        fullName.includes(searchFilter.toLowerCase()) ||
        member.identification?.toString().includes(searchFilter.toLowerCase());

      const matchesCity =
        cityFilter === "" || member.address?.toLowerCase().includes(cityFilter.toLowerCase());

      return matchesSearch && matchesCity;
    });
  }, [members, searchFilter, cityFilter]);

  // VER SOLICITUD
  const handleView = async (member: Member) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8081/api/members/list_member_by_id?id=${member.member_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar datos del miembro");
      }

      const data = await response.json();
      setSelectedMember(data);
      setOpenViewModal(true);
    } catch (err) {
      console.error("Error al cargar datos del miembro:", err);
      alert("Error al cargar los detalles del miembro");
    } finally {
      setLoading(false);
    }
  };

  // ACEPTAR DESDE EL MODAL
  const handleAcceptFromModal = async () => {
    if (!selectedMember) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8081/api/members/update_member_status/${selectedMember.member_id}?status=ACCEPTED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al aceptar solicitud");
      }

      // Cerrar modal
      setOpenViewModal(false);
      setSelectedMember(null);

      alert(`Solicitud de ${selectedMember.first_name} ${selectedMember.last_name} aceptada exitosamente`);
      
      // Recargar lista
      await cargarMiembros();
    } catch (err: unknown) {
      console.error("Error al aceptar solicitud:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      alert("Error al aceptar la solicitud: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ABRIR MODAL DE RECHAZO
  const handleRejectFromModal = () => {
    // Cerrar modal de vista y abrir modal de rechazo
    setOpenViewModal(false);
    setOpenRejectModal(true);
  };

  // ENVIAR RECHAZO
  const handleSendReject = async () => {
    if (!selectedMember) return;

    if (!rejectReason.trim()) {
      alert("Por favor, ingresa una razón para el rechazo");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8081/api/members/update_member_status/${selectedMember.member_id}?status=NOT_ACCEPTED`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al rechazar solicitud");
      }

      // Cerrar modales y limpiar
      setOpenRejectModal(false);
      setRejectReason("");
      setSelectedMember(null);
      setOpenConfirmModal(true);

      // Recargar miembros
      await cargarMiembros();
    } catch (err: unknown) {
      console.error("Error al rechazar solicitud:", err);
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      alert("Error al rechazar la solicitud: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Solicitudes</p>
        <p className="text-2xl text-text font-medium my-5">
          Aquí se mostrarán las solicitudes pendientes.
        </p>
      </header>

      {/* Filtros */}
      <section className="my-8 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex w-full md:w-2/3 gap-4">
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o documento..."
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
            <BrushCleaning size={16} /> Limpiar
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={cargarMiembros}
          disabled={loading}
          className="px-4"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </Button>
      </section>

      {/* Tabla de miembros */}
      <section className="mt-6 space-y-4">
        <div className="border-3 border-primary rounded-lg overflow-hidden">
          <Table className="text-sm">
            <TableHeader className="text-primary">
              <TableRow className="border-b border-primary hover:bg-transparent">
                <TableHead className="pl-4 font-bold text-primary">Id</TableHead>
                <TableHead className="font-bold text-primary">Nombres</TableHead>
                <TableHead className="font-bold text-primary">Apellidos</TableHead>
                <TableHead className="font-bold text-primary">Identificación</TableHead>
                <TableHead className="font-bold text-primary">Ciudad</TableHead>
                <TableHead className="text-center font-bold text-primary">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-text text-lg">Cargando solicitudes...</p>
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.member_id} className="border-primary">
                    <TableCell className="pl-4 font-medium">{member.member_id}</TableCell>
                    <TableCell>{member.first_name}</TableCell>
                    <TableCell>{member.last_name}</TableCell>
                    <TableCell>{member.identification}</TableCell>
                    <TableCell>{member.address?.split(",")[0] || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          title="Ver detalles"
                          onClick={() => handleView(member)}
                          disabled={loading}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-text text-lg">
                      No se encontraron solicitudes que coincidan con los filtros.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Modal ver formulario con botones de acción */}
      <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la solicitud</DialogTitle>
          </DialogHeader>
          {loading ? (
            <p>Cargando...</p>
          ) : (
            selectedMember && (
              <div className="space-y-2 text-sm">
                <p><b>Nombres:</b> {selectedMember.first_name}</p>
                <p><b>Apellidos:</b> {selectedMember.last_name}</p>
                <p><b>Correo:</b> {selectedMember.email}</p>
                <p><b>Tipo Documento:</b> {selectedMember.document_type}</p>
                <p><b>Número Documento:</b> {selectedMember.identification}</p>
                <p><b>Fecha Nacimiento:</b> {selectedMember.birth_date}</p>
                <p><b>Dirección:</b> {selectedMember.address}</p>
                <p><b>Teléfono:</b> {selectedMember.phone}</p>
                <p><b>Sexo:</b> {selectedMember.gender}</p>
                <p><b>Peso:</b> {selectedMember.weight} kg</p>
                <p><b>Estatura:</b> {selectedMember.height} cm</p>
                <p><b>Pasatiempos:</b> {selectedMember.hobbies || "N/A"}</p>
                <p><b>Deportes:</b> {selectedMember.sports || "N/A"}</p>
                <p><b>Instrumentos:</b> {selectedMember.instruments || "N/A"}</p>
                <p><b>Estado:</b> {selectedMember.status}</p>
              </div>
            )
          )}
          <DialogFooter className="flex gap-2 sm:gap-2">
        
            <Button 
              variant="destructive" 
              onClick={handleRejectFromModal}
              disabled={loading}
            >
              Rechazar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAcceptFromModal}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Aceptar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal rechazo */}
      <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar solicitud</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <p className="text-sm mb-2">
              ¿Estás seguro de rechazar la solicitud de <b>{selectedMember.first_name} {selectedMember.last_name}</b>?
            </p>
          )}
          <p className="text-sm text-gray-600">Escribe las razones del rechazo:</p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Razones del rechazo..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={() => {
                setOpenRejectModal(false);
                setRejectReason("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary"
              onClick={handleSendReject} 
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmación */}
      <Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Solicitud procesada</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            La solicitud ha sido rechazada correctamente.
          </p>
          <DialogFooter>
            <Button onClick={() => setOpenConfirmModal(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Requests;