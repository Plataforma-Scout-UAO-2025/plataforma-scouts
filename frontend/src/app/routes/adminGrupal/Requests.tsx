import { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/index";
import { Eye, Check, X } from "lucide-react";
import { membersData } from "@/lib/mockObjects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
const Requests = () => {
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  // === VER SOLICITUD ===
  const handleView = async (member: any) => {
    try {
      setLoading(true);
      setSelectedMember(member);

      // TODO: Llamar backend para obtener formulario
      // const res = await fetch(`/api/members/${member.id}`);
      // const data = await res.json();
      // setSelectedMember(data);

      setOpenViewModal(true);
    } catch (err) {
      console.error("Error al cargar datos del miembro:", err);
    } finally {
      setLoading(false);
    }
  };

  // === ACEPTAR SOLICITUD ===
  const handleAccept = async (member: any) => {
    try {
      setLoading(true);

      // TODO: Llamar backend para aceptar solicitud
      // await fetch(`/api/members/${member.id}/accept`, { method: "POST" });

      alert(`Solicitud del usuario ${member.firstName} aceptada `);
    } catch (err) {
      console.error("Error al aceptar solicitud:", err);
    } finally {
      setLoading(false);
    }
  };

  // === RECHAZAR SOLICITUD ===
  const handleReject = (member: any) => {
    setSelectedMember(member);
    setOpenRejectModal(true);
  };

  const handleSendReject = async () => {
    if (!selectedMember) return;
    try {
      setLoading(true);

      // TODO: Llamar backend para rechazar solicitud
      // await fetch(`/api/members/${selectedMember.id}/reject`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ reason: rejectReason }),
      // });

      setOpenRejectModal(false);
      setRejectReason("");
      setOpenConfirmModal(true);
    } catch (err) {
      console.error("Error al rechazar solicitud:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Solicitudes</p>
        <p className="text-2xl text-text font-medium my-5">
          Aquí se mostrarán las solicitudes.
        </p>
      </header>

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
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersData.map((member) => (
                <TableRow key={member.id} className="border-primary">
                  <TableCell className="pl-4 font-medium">{member.id}</TableCell>
                  <TableCell>{member.firstName}</TableCell>
                  <TableCell>{member.lastName}</TableCell>
                  <TableCell>{member.identification}</TableCell>
                  <TableCell>{member.city}</TableCell>
                  <TableCell className="text-right">
                  <div className="flex justify-center gap-2">
                      {/* Botón ver */}
                      <Button
                      variant="primary"
                      size="icon"
                      title="Ver"
                      onClick={() => handleView(member)}
                    >
                       <Eye size={18} />
                    </Button>

                    {/* Botón aceptar */}
                    <Button
                      variant="outline"
                      size="icon"
                      title="Aceptar"
                      onClick={() => handleAccept(member)}
                    >
                      <Check size={18} />
                    </Button>

                    {/* Botón rechazar */}
                    <Button
                      variant="destructive"
                      size="icon"
                      title="Rechazar"
                      onClick={() => handleReject(member)}
                    >
                      <X size={18} />
                    </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Modal ver formulario */}
     <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Formulario del usuario</DialogTitle>
    </DialogHeader>
    {loading ? (
      <p>Cargando...</p>
    ) : (
      selectedMember && (
        <div className="space-y-2 text-sm">
          <p><b>Nombres:</b> {selectedMember.nombres || selectedMember.firstName}</p>
          <p><b>Apellidos:</b> {selectedMember.apellidos || selectedMember.lastName}</p>
          <p><b>Correo:</b> {selectedMember.correo}</p>
          <p><b>Tipo Documento:</b> {selectedMember.tipoDocumento}</p>
          <p><b>Número Documento:</b> {selectedMember.numeroDocumento || selectedMember.identification}</p>
          <p><b>Fecha Nacimiento:</b> {selectedMember.fechaNacimiento}</p>
          <p><b>Ciudad:</b> {selectedMember.ciudad || selectedMember.city}</p>
          <p><b>Dirección:</b> {selectedMember.direccion}</p>
          <p><b>Barrio:</b> {selectedMember.barrio}</p>
          <p><b>Teléfono:</b> {selectedMember.telefono}</p>
          <p><b>Institución:</b> {selectedMember.institucion}</p>
          <p><b>Curso:</b> {selectedMember.curso}</p>
          <p><b>Calendario:</b> {selectedMember.calendario}</p>
          <p><b>Jornada:</b> {selectedMember.jornada}</p>
          <p><b>Sexo:</b> {selectedMember.sexo}</p>
          <p><b>Peso:</b> {selectedMember.peso}</p>
          <p><b>Estatura:</b> {selectedMember.estatura}</p>
          <p><b>Pasatiempos:</b> {selectedMember.pasatiempos}</p>
          <p><b>Deportes:</b> {selectedMember.deportes}</p>
          <p><b>Instrumentos:</b> {selectedMember.instrumentos}</p>
          <p><b>Grupo:</b> {selectedMember.grupo}</p>
          <p><b>Rama:</b> {selectedMember.rama || selectedMember.branch}</p>
          <p><b>Estado de cuenta:</b> {selectedMember.statusAccount}</p>
        </div>
      )
    )}
    <DialogFooter>
      <Button onClick={() => setOpenViewModal(false)}>Cerrar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      {/* Modal rechazo */}
      <Dialog open={openRejectModal} onOpenChange={setOpenRejectModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar solicitud</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Escribe las razones del rechazo:
          </p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Razones del rechazo..."
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenRejectModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendReject} disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal confirmación */}
      <Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Mensaje enviado</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            El comentario fue enviado correctamente.
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
