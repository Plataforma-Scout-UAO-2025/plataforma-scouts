import { useRef, useState, useEffect } from "react";
import { Button } from "./button";
import { Label } from "./label";
import { Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fixSupabaseUrl } from "@/lib/imageUtils";

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (objectId: string) => void;
  onUpload: (file: File) => Promise<string>;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  label,
  value,
  onChange,
  onUpload,
  className,
  disabled = false,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // Limpiar el preview cuando cambia el value desde fuera
  useEffect(() => {
    if (!value) {
      setPreview(null);
      setFileName("");
    }
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validar tamaño máximo (5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > MAX_SIZE) {
      alert("El archivo es demasiado grande. El tamaño máximo es 5MB");
      return;
    }

    // Validar tipos de archivo permitidos
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert("Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP, SVG");
      return;
    }

    // Crear preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setFileName(file.name);

    // Subir archivo
    setUploading(true);
    try {
      const objectId = await onUpload(file);
      onChange(objectId);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      setPreview(null);
      setFileName("");
      alert("Error al subir la imagen. Por favor intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const currentPreview = preview || (value ? fixSupabaseUrl(value) : null);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm text-accent-foreground">{label}</Label>
      
      <div className="flex items-center gap-3">
        {/* Preview o placeholder */}
        <div className="relative w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
          {currentPreview ? (
            <img
              src={currentPreview}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex-1 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? "Subiendo..." : currentPreview ? "Cambiar imagen" : "Seleccionar imagen"}
          </Button>

          {(currentPreview || fileName) && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 truncate max-w-[150px]">
                {fileName || "Imagen cargada"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
