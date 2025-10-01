import { useState } from 'react';
import { X, Upload } from 'lucide-react';
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
import type { CreateRamaFormData } from '../schemas/rama.schema';
import type { CreateRamaData } from '../types/rama.type';

interface CreateRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRamaData) => Promise<void>;
}

export default function CreateRamaModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CreateRamaFormData>({
    nombre: '',
    descripcion: '',
    edadMinima: 7,
    edadMaxima: 10,
    año: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Crear el objeto de datos incluyendo el archivo de imagen si existe
      const dataWithFile = {
        ...formData,
        iconFile: selectedFile || undefined,
        galleryFiles: undefined
      };
      
      await onSubmit(dataWithFile);
      // Reset form
      setFormData({
        nombre: '',
        descripcion: '',
        edadMinima: 7,
        edadMaxima: 10,
        año: new Date().getFullYear(),
      });
      setSelectedFile(null);
      setImagenUrl(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear rama:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        edadMinima: 7,
        edadMaxima: 10,
        año: new Date().getFullYear(),
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
              value={formData.nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData(prev => ({ ...prev, nombre: e.target.value }))
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
              value={formData.descripcion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, descripcion: e.target.value }))
              }
              className="w-full bg-background border border-border rounded-md resize-none focus:ring-primary focus:border-primary min-h-[100px] placeholder:text-muted-foreground"
              rows={4}
            />
          </div>

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
              {isSubmitting ? 'Guardando...' : 'Guardar Rama'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
