import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { CreateRamaFormData } from '../schemas/rama.schema';

interface CreateRamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRamaFormData) => Promise<void>;
}

export default function CreateRamaModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateRamaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      await onSubmit(formData);
      // Reset form
      setFormData({
        nombre: '',
        descripcion: '',
        edadMinima: 7,
        edadMaxima: 10,
        año: new Date().getFullYear(),
      });
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
            <Label htmlFor="icono" className="text-foreground">
              Icono
            </Label>
            <div className="relative">
              <Input
                id="icono"
                type="text"
                readOnly
                value=""
                placeholder="Seleccionar icono (Opcional)"
                className="w-full bg-card border border-border rounded-md focus:ring-primary focus:border-primary pr-10 cursor-pointer placeholder:text-muted-foreground"
                onClick={() => {
                  // Aquí iría la lógica para abrir selector de archivos
                  console.log('Abrir selector de iconos');
                }}
              />
              <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
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
