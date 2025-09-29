import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { subirImagen } from '../services/storage.service';
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
import type { Rama, UpdateRamaData } from '../types/rama.type';

interface EditRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rama: Rama | null;
  onSubmit: (data: UpdateRamaData) => Promise<void>;
}

export default function EditRamaModal({
  open,
  onOpenChange,
  rama,
  onSubmit,
}: EditRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateRamaData>({
    id: '',
    nombre: '',
    descripcion: '',
    edadMinima: 0,
    edadMaxima: 0,
    estado: 'activa',
  });

  useEffect(() => {
    if (rama) {
      setFormData({
        id: rama.id,
        nombre: rama.nombre,
        descripcion: rama.descripcion,
        edadMinima: rama.edadMinima,
        edadMaxima: rama.edadMaxima,
        estado: rama.estado,
      });
      if (rama.icono) setImagenUrl(rama.icono);
    }
  }, [rama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error al editar rama:', error);
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
              value={formData.nombre || ''}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              required
            />
          </div>

          {/* Campo Icono */}
          <div className="space-y-2">
            <Label htmlFor="icono-file-edit" className="text-sm font-medium text-foreground">
              Icono
            </Label>
            <div className="flex items-center space-x-3">
              <input
                id="icono-file-edit"
                name="icono-file-edit"
                type="file"
                accept="image/*"
                title="Seleccionar icono"
                aria-label="Seleccionar icono"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsUploading(true);
                  try {
                    const url = await subirImagen(file);
                    setImagenUrl(url);
                    setFormData(prev => ({ ...prev, // @ts-ignore
                      icono: url }));
                  } catch (err) {
                    console.error('Error subiendo imagen:', err);
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
              {isUploading ? (
                <div className="text-sm text-muted-foreground">Subiendo...</div>
              ) : imagenUrl ? (
                <img src={imagenUrl} alt="icono" className="h-8 w-8 rounded object-cover" />
              ) : (
                <div className="text-sm text-muted-foreground">No hay imagen seleccionada</div>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-foreground">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción opcional..."
              className="bg-background border border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary resize-none"
            />
          </div>

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
              {isSubmitting ? 'Guardando...' : 'Guardar Rama'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
