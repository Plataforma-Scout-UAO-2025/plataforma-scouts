import { useState } from 'react';
import { X } from 'lucide-react';
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
import type { CreateSubgroupData } from '../types/frontend';

interface CreateSubramaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ramaId: string;
  onSubmit: (data: CreateSubgroupData) => Promise<void>;
}

export default function CreateSubramaModal({
  open,
  onOpenChange,
  ramaId,
  onSubmit,
}: CreateSubramaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateSubgroupData = {
        name: formData.name,
        description: formData.description || undefined,
        branchId: ramaId,
      };
      await onSubmit(payload);
      // Reset form
      setFormData({
        name: '',
        description: '',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error al crear subrama:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData({
        name: '',
        description: '',
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
            Crear Nueva Subrama
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Completa los campos para crear una subrama dentro de la rama seleccionada.
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
          {/* Campo Nombre de la Subrama */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">
              Nombre de la Subrama
            </Label>
            <Input
              id="nombre"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData(prev => ({ ...prev, name: e.target.value }))
              }
              className="w-full bg-card border border-border rounded-md focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Campo Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-foreground">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Descripción opcional..."
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
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
              {isSubmitting ? 'Guardando...' : 'Guardar Subrama'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
