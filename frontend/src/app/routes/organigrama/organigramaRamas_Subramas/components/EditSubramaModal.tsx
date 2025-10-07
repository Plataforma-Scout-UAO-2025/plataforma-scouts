import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Subgroup, UpdateSubgroupData } from '../types/frontend';

interface EditSubramaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subrama: Subgroup | null;
  onSubmit: (data: UpdateSubgroupData) => Promise<void>;
}

export default function EditSubramaModal({
  open,
  onOpenChange,
  subrama,
  onSubmit,
}: EditSubramaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<{
    id: string;
    subgroup_id?: string;
    name: string;
    description: string;
    leader?: string;
    statusAlias: string;
    ramaId?: string;
    branchId?: string;
  }>>({
    id: '',
    subgroup_id: undefined,
    name: '',
    description: '',
    leader: '',
    statusAlias: 'activa',
  });

  useEffect(() => {
    if (subrama) {
      setFormData({
        id: subrama.id,
        subgroup_id: subrama.subgroup_id ?? subrama.id,
        name: subrama.nombre ?? subrama.name,
        description: subrama.description ?? undefined,
        leader: subrama.leader ?? undefined,
        statusAlias: subrama.estado ?? (subrama.status === 'active' ? 'activa' : 'inactiva'),
      });
    }
  }, [subrama]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: UpdateSubgroupData = {
        id: formData.id as string,
        name: formData.name ?? undefined,
        description: formData.description ?? undefined,
        leader: formData.leader ?? undefined,
        status: (formData.statusAlias === 'activa') ? 'active' : undefined,
        branchId: formData.ramaId ?? formData.branchId ?? undefined,
      };

      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error al editar subrama:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!subrama) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-xl shadow-lg border border-border" showCloseButton={false}>
        <DialogHeader className="relative pb-4">
          <DialogTitle className="text-2xl font-bold text-primary pr-8">
            Editar Subrama
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modifica los detalles de la subrama seleccionada.
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
          {/* Nombre de la Subrama */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">Nombre de la Subrama</Label>
              <Input
              id="nombre"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-card border border-border rounded-md focus:ring-primary focus:border-primary placeholder:text-muted-foreground"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-foreground">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional..."
              className="w-full bg-background border border-border rounded-md resize-none focus:ring-primary focus:border-primary min-h-[100px] placeholder:text-muted-foreground"
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
              {isSubmitting ? 'Guardando...' : 'Guardar Subrama'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
