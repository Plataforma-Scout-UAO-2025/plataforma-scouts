import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface FotoModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  imageUrl: string | null;
  onReplace: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function FotoModal({
  open,
  onClose,
  titulo,
  imageUrl,
  onReplace,
  onDelete,
}: FotoModalProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      await onReplace(file);
    } catch (err) {
      console.error("❌ Error reemplazando foto:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete();
      setPreview(null);
      onClose();
    } catch (err) {
      console.error("❌ Error eliminando foto:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A4134]">
            {titulo}
          </DialogTitle>
        </DialogHeader>

        <div className="flex justify-center items-center mt-4">
          {preview ? (
            <img
              src={preview}
              alt="Foto"
              className="rounded-lg max-h-[320px] object-contain border border-gray-200"
            />
          ) : (
            <div className="text-gray-400 text-sm">No hay foto disponible</div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-[#1A4134] text-[#1A4134] hover:bg-[#1A4134] hover:text-white"
              onClick={() => document.getElementById("inputFileModal")?.click()}
              disabled={isProcessing}
            >
              Cambiar foto
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              Eliminar
            </Button>
          </div>
        </DialogFooter>

        <input
          id="inputFileModal"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
}
