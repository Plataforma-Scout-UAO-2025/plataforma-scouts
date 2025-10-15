import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
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
import type { CreateBranchData } from '../types/frontend';
// schema types are available but this component uses a legacy form shape during migration

interface CreateRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Accept legacy payload shapes during migration
  onSubmit: (data: CreateBranchData) => Promise<void>;
  onSuccess?: () => void; // Callback para refrescar datos en la página principal
}

export default function CreateRamaModal({
  open,
  onOpenChange,
  onSubmit,
  onSuccess,
}: CreateRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { error, handleError, clearError } = useApiError();
  type FormState = {
    name?: string;
    nombre?: string;
    description?: string;
    descripcion?: string;
    minAge?: number;
    maxAge?: number;
    edadMinima?: number;
    edadMaxima?: number;
    year?: number;
    año?: number;
  };

  const [formData, setFormData] = useState<FormState>({
    name: '',
    description: '',
    minAge: 7,
    maxAge: 10,
    year: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    clearError();
    
    setIsSubmitting(true);
    try {
      // Mapear el formulario (campos en español) al nuevo tipo CreateBranchData
      const payload: CreateBranchData = {
        name: (formData.name ?? formData.nombre) ?? '',
        description: (formData.description ?? formData.descripcion) || undefined,
        minAge: (formData.minAge ?? formData.edadMinima) ?? 7,
        maxAge: (formData.maxAge ?? formData.edadMaxima) ?? 10,
  year: (formData.year ?? formData['año']) ?? new Date().getFullYear(),
        iconFile: selectedFile || undefined,
        galleryFiles: undefined,
      };
      
      await onSubmit(payload);
      
      // Reset form después del éxito
      setFormData({
        name: '',
        description: '',
        minAge: 7,
        maxAge: 10,
        year: new Date().getFullYear(),
      });
      setSelectedFile(null);
      setImagenUrl(null);
      onOpenChange(false);
      
      // Llamar callback de éxito para refrescar datos
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al crear rama:', error);
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: '',
        description: '',
        minAge: 7,
        maxAge: 10,
        year: new Date().getFullYear(),
      });
      setSelectedFile(null);
      setImagenUrl(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] bg-card rounded-xl shadow-lg border border-border"
        showCloseButton={false}
      >
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-primary pr-8">
            Crear Nueva Rama
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Proporciona los datos básicos para crear una nueva rama.
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
          {/* Campo Nombre de la Rama */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">
              Nombre de la Rama
            </Label>
            <Input
              id="nombre"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-card border border-border rounded-md focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Campo Icono */}
          <div className="space-y-2">
            <Label htmlFor="icono-file-create" className="text-foreground">
              Icono
            </Label>
            <div>
              <div
                role="button"
                tabIndex={0}
                onClick={() => document.getElementById('icono-file-create')?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') document.getElementById('icono-file-create')?.click(); }}
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
                id="icono-file-create"
                name="icono-file-create"
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
                      // Almacenar el archivo para enviarlo después en el submit
                      setSelectedFile(file);
                      
                      // Crear una URL temporal para mostrar la preview
                      const previewUrl = URL.createObjectURL(file);
                      setImagenUrl(previewUrl);
                    } catch (err) {
                      console.error('Error procesando imagen:', err);
                    } finally {
                      setIsUploading(false);
                    }
                  }}
              />
            </div>
          </div>

          {/* Campo Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-foreground">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción opcional de la rama..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full bg-background border border-border rounded-md resize-none focus:ring-primary focus:border-primary min-h-[100px] placeholder:text-muted-foreground"
              rows={4}
            />
          </div>

          {/* Mostrar error si existe */}
          {error.hasError && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error.message}</p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4">
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
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-primary-foreground"
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
