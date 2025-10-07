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
import type { Member } from "@/models/types/memberTypes";
import {
  getMembersByStatus,
  getMember,
  updateMemberStatus,
} from "@/api/membersApi";

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

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    ACCEPTED: "Aceptado",
    NOT_ACCEPTED: "Rechazado",
  };

  // Cargar solicitudes pendientes
  const loadPendingMembers = async () => {
    try {
      setLoading(true);
      const data = await getMembersByStatus("PENDING");
      setMembers(data);
    } catch (error) {
      console.error("Error al cargar solicitudes:", error);
      alert("Error al cargar las solicitudes pendientes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingMembers();
  }, []);

  // Obtener ciudades únicas
  const cities = useMemo(() => {
    const uniqueCities = [
      ...new Set(members.map((m) => m.address?.split(",")[0]).filter(Boolean)),
    ];
    return uniqueCities.sort();
  }, [members]);

  // Filtro combinado
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

  // Ver detalles
  const handleView = async (member: Member) => {
    try {
      setLoading(true);
      const data = await getMember(member.member_id);
      setSelectedMember(data);
      setOpenViewModal(true);
    } catch (err) {
      console.error("Error al obtener detalles:", err);
      alert("Error al cargar los detalles del miembro");
    } finally {
      setLoading(false);
    }
  };

  // Aceptar solicitud
  const handleAcceptFromModal = async () => {
    if (!selectedMember) return;
    try {
      setLoading(true);
      await updateMemberStatus(Number(selectedMember.member_id), "ACCEPTED");
      alert(
        `Solicitud de ${selectedMember.first_name} ${selectedMember.last_name} aceptada exitosamente`
      );
      setOpenViewModal(false);
      setSelectedMember(null);
      await loadPendingMembers();
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);
      alert("Error al aceptar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de rechazo
  const handleRejectFromModal = () => {
    setOpenViewModal(false);
    setOpenRejectModal(true);
  };

  // Enviar rechazo
  const handleSendReject = async () => {
    if (!selectedMember) return;
    if (!rejectReason.trim()) {
      alert("Por favor, ingresa una razón para el rechazo");
      return;
    }
    try {
      setLoading(true);
      await updateMemberStatus(
        Number(selectedMember.member_id),
        "NOT_ACCEPTED"
      );
      setOpenRejectModal(false);
      setRejectReason("");
      setSelectedMember(null);
      setOpenConfirmModal(true);
      await loadPendingMembers();
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
      alert("Error al rechazar la solicitud");
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
            placeholder="Buscar por nombre o documento..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-2/3 flex h-auto border-primary"
          />
          <DropdownMenu onOpenChange={setIsActive}>
            <DropdownMenuTrigger className="w-1/3 py-1 px-2 text-sm border border-primary rounded-md justify-between flex items-center">
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
            <BrushCleaning size={16} /> Limpiar
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={loadPendingMembers}
          disabled={loading}
          className="px-4"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </Button>
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
                <TableHead className="text-center font-bold">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando solicitudes...
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
                      <span className="py-1 rounded font-medium bg-gray-300 text-gray-800">
                        {statusLabels[member.status ?? "Pendiente"]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        title="Ver detalles"
                        onClick={() => handleView(member)}
                        disabled={loading}
                      >
                        <Eye size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron solicitudes pendientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Modal Ver */}
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
                  {statusLabels[selectedMember.status ?? "Pendiente"]}
                </p>
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
              ¿Estás seguro de rechazar la solicitud de{" "}
              <b>
                {selectedMember.first_name} {selectedMember.last_name}
              </b>
              ?
            </p>
          )}
          <p className="text-sm text-gray-600">
            Escribe las razones del rechazo:
          </p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Razones del rechazo..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpenRejectModal(false)}
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
