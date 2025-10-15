import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Label, Textarea } from "@/components/ui/index";
import type { Member } from "@/types/member.type";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateMemberStatusAction } from "@/store/members/membersActions";
import { toast } from "sonner";

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onSuccess: () => void;
}

export default function RejectModal({
  open,
  onOpenChange,
  member,
  onSuccess,
}: RejectModalProps) {
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setReason("");
  }, [open, member?.member_id]);

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!member) return;
    try {
      setLoading(true);

      await dispatch(
        updateMemberStatusAction({
          id: member.member_id as string | number,
          status: "REJECTED",
        })
      ).unwrap();

      toast.success(
        `Se rechazó la solicitud de ${member.first_name} ${member.last_name}.`
      );

      handleClose();
      onSuccess();
    } catch (e: any) {
      console.error("Error al rechazar solicitud:", e);
      toast.error(e?.message || "Ocurrió un error al procesar el rechazo.");
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Rechazar solicitud</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Estás a punto de rechazar la solicitud de{" "}
            <span className="font-semibold">
              {member.first_name} {member.last_name}
            </span>
            . Esta acción actualizará el estado a{" "}
            <span className="font-semibold">REJECTED</span>.
          </p>

          <div className="space-y-1">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Textarea
              id="reason"
              placeholder="Escribe el motivo del rechazo (opcional)"
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              El motivo no se envía al backend por ahora; si lo necesitas, puedo
              incluirlo en una acción o registrar un log.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading || !member}
          >
            {loading ? "Procesando..." : "Rechazar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
