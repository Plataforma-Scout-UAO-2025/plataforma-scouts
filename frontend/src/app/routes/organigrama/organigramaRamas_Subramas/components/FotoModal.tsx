import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription } from "@/components/ui/dialog";

interface FotoModalProps {
  open: boolean;
  onClose: () => void;
  titulo: string;
  imageUrl: string | null;
  onReplace: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancelUpload?: () => void;
}

export default function FotoModal({
  open,
  onClose,
  titulo,
  imageUrl,
  onReplace,
  onDelete,
  onCancelUpload,
}: FotoModalProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl);
  const [isProcessing, setIsProcessing] = useState(false);
  const createdObjectUrlRef = useRef<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const obj = URL.createObjectURL(file);
      if (createdObjectUrlRef.current) {
        try { URL.revokeObjectURL(createdObjectUrlRef.current); } catch { /* ignore */ }
      }
      createdObjectUrlRef.current = obj;
      setPreview(obj);
      setIsProcessing(true);
      void onReplace(file).finally(() => {
        setIsProcessing(false);
      });
    } catch (err) {
      console.error("❌ Error creando preview de foto:", err);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onDelete?.();
      setPreview(null);
      onClose();
    } catch (err) {
      console.error("❌ Error eliminando foto:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (imageUrl && !imageUrl.startsWith('blob:')) {
      setPreview(imageUrl);
    }
    return () => {
      if (createdObjectUrlRef.current) {
        try { URL.revokeObjectURL(createdObjectUrlRef.current); } catch { /* ignore */ }
        createdObjectUrlRef.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A4134]">
            {titulo}
          </DialogTitle>
          <DialogDescription>Editar o eliminar la imagen seleccionada.</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center items-center mt-4 relative">
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
          <Button variant="outline" onClick={() => { if (onCancelUpload) { onCancelUpload(); } onClose(); }}>
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
          aria-label="Seleccionar imagen"
          onChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
}
