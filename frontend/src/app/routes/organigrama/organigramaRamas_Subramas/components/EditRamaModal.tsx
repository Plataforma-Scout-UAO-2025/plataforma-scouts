import { useState, useEffect } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { uploadSectionIcon } from '../services';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApiError } from '../hooks/useApiError';
import type { Branch as Rama, UpdateBranchData } from '../types/frontend';

interface EditRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rama: Rama | null;
  // onSubmit expects UpdateBranchData
  onSubmit: (data: UpdateBranchData) => Promise<void>;
  onSuccess?: () => void; // Callback para refrescar datos
}

export default function EditRamaModal({
  open,
  onOpenChange,
  rama,
  onSubmit,
  onSuccess,
}: EditRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const { error, handleError, clearError } = useApiError();
  type FormState = Partial<{
    id: string;
    name: string;
    description: string;
    minAge: number;
    maxAge: number;
    statusAlias: string;
    iconoFile?: File;
    galleryFiles?: File[];
    // preview URL (legacy alias kept for local state only)
    icono?: string;
  }>;

  const [formData, setFormData] = useState<FormState>({
    id: '',
    name: '',
    description: '',
    minAge: 0,
    maxAge: 0,
    statusAlias: 'activa',
  });

  useEffect(() => {
    if (rama) {
      // Leer aliases legacy desde el objeto rama de forma segura
      const legacy = rama as unknown as Record<string, unknown>;
      const legacyEdadMinima = legacy['edadMinima'] as number | undefined;
      const legacyEdadMaxima = legacy['edadMaxima'] as number | undefined;
      const legacyNombre = (legacy['nombre'] as string | undefined) ?? undefined;
      const legacyDescripcion = (legacy['descripcion'] as string | undefined) ?? undefined;
      const legacyIcono = (legacy['icono'] as string | undefined) ?? undefined;

      setFormData((prev) => ({
        ...prev,
        id: rama.id,
        name: legacyNombre ?? rama.name,
        description: legacyDescripcion ?? rama.description ?? undefined,
        minAge: rama.minAge ?? legacyEdadMinima ?? 0,
        maxAge: rama.maxAge ?? legacyEdadMaxima ?? 0,
        statusAlias: rama.estado ?? (rama.status === 'active' ? 'activa' : 'inactiva'),
        icono: legacyIcono ?? rama.iconUrl ?? prev.icono,
      }));

      setImagenUrl(legacyIcono ?? rama.iconUrl ?? null);
    }
  }, [rama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearError();
    
    setIsSubmitting(true);
    try {
      const payload: UpdateBranchData = {
        id: formData.id as string,
        name: formData.name ?? undefined,
        description: formData.description ?? undefined,
        minAge: formData.minAge ?? undefined,
        maxAge: formData.maxAge ?? undefined,
        status: (formData.statusAlias === 'activa') ? 'active' : undefined,
        iconFile: formData.iconoFile ?? undefined,
        galleryFiles: formData.galleryFiles ?? undefined,
      };

      await onSubmit(payload);
      onOpenChange(false);
      
      // Llamar callback de éxito para refrescar datos
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('❌ Error al editar rama:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!rama) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-xl shadow-lg border border-border" showCloseButton={false}>
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-primary pr-8">
            Editar Rama
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifica los detalles de la rama seleccionada.
          </DialogDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0 h-6 w-6 p-0 hover:bg-accent"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la Rama */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">Nombre de la Rama</Label>
        <Input
          id="nombre"
          value={formData.name || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
                required
              />
          </div>

          {/* Campo Icono */}
          <div className="space-y-2">
            <Label htmlFor="icono-file-edit" className="text-sm font-medium text-foreground">
              Icono
            </Label>
            <div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => document.getElementById('icono-file-edit')?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('icono-file-edit')?.click(); }}
                className="w-full bg-card border border-border rounded-md px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-accent"
              >
                <div className="text-muted-foreground">Seleccionar icono (Opcional)</div>
                <div className="flex items-center gap-3">
                  {isUploading ? (
                    <div className="text-sm text-muted-foreground">Subiendo...</div>
                  ) : imagenUrl ? (
                    <img src={imagenUrl} alt="icono" className="h-8 w-8 rounded object-cover" />
                  ) : (
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <input
                id="icono-file-edit"
                name="icono-file-edit"
                type="file"
                accept="image/*"
                className="hidden"
                title="Seleccionar icono"
                aria-label="Seleccionar icono"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  try {
                    // Para edición sí tenemos rama.id
                    const url = await uploadSectionIcon('', '', rama.id, file);
                    setImagenUrl(url);
                    setFormData((prev) => ({ ...prev, icono: url }));
                  } catch (err) {
                    console.error('Error subiendo imagen:', err);
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-foreground">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción opcional..."
              className="w-full bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary resize-none"
            />
          </div>

          {/* Mostrar error si existe */}
          {error.hasError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error.message}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6 py-2 border border-secondary text-secondary hover:bg-accent"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-primary hover:bg-primary-hover text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Rama'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
