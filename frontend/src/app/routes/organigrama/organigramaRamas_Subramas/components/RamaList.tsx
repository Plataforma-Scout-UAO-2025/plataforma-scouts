import { useState } from 'react';
import { Eye, Edit2, Trash2, ChevronDown, Users, Plus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { Branch as Rama, Subgroup as Subrama } from '../types/frontend';

interface RamaListProps {
  ramas: Rama[];
  onEditRama: (rama: Rama) => void;
  onDeleteRama: (rama: Rama) => void;
  onCreateSubrama: (ramaId: string) => void;
  onEditSubrama: (subrama: Subrama) => void;
  onDeleteSubrama: (subrama: Subrama) => void;
}

export default function RamaList({
  ramas,
  onEditRama,
  onDeleteRama,
  onCreateSubrama,
  onEditSubrama,
  onDeleteSubrama,
}: RamaListProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleToggleExpansion = (ramaId: string) => {
    setExpandedItems(prev => 
      prev.includes(ramaId) 
        ? prev.filter(id => id !== ramaId)
        : [...prev, ramaId]
    );
  };

  if (ramas.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No hay ramas disponibles
        </h3>
        <p className="text-sm text-muted-foreground">
          Comienza creando tu primera rama
        </p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" value={expandedItems} className="space-y-4">
      {ramas.map((rama, index) => {
  const ramaId = [
    rama.sectionId,
    (rama as unknown as Record<string, unknown>)['section_id'],
    rama.id,
    (rama as unknown as Record<string, unknown>)['ramaId'],
  ]
    .map((candidate) =>
      typeof candidate === 'string'
        ? candidate.trim()
        : candidate !== undefined && candidate !== null
          ? String(candidate)
          : ''
    )
    .find((candidate) => candidate.length > 0) ?? '';

  const ramaKey = ramaId || `rama-${index}`;
  const ramaDisplayName = rama.name ?? rama.nombre ?? '';
  const ramaEstado = rama.estado ?? (rama.status === 'active' ? 'activa' : 'inactiva');
  const ramaIsActive = (rama.estado !== undefined ? String(rama.estado) === 'activa' : rama.status === 'active');

  const handleNavigateRama = () => {
    if (!ramaId) {
      console.warn(' [RamaList] Intento de navegar a una rama sin ID válido');
      return;
    }
    navigate(`/app/organigrama/rama/${ramaId}`);
  };

  const handleCreateSubrama = () => {
    if (!ramaId) {
      console.warn(' [RamaList] No se puede crear subrama porque la rama no tiene ID');
      return;
    }
    onCreateSubrama(ramaId);
  };

        return (
          <AccordionItem key={ramaKey} value={ramaKey} className="border rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 rounded-t-lg">
              <AccordionTrigger className="flex-1 hover:no-underline [&>svg]:hidden p-0" onClick={() => handleToggleExpansion(ramaKey)}>
                <div className="flex items-center space-x-3">
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedItems.includes(ramaKey) ? 'rotate-180' : ''}`} />
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">Rama: {ramaDisplayName}</span>
                    
                      {ramaEstado !== 'activa' ? (
                        <Badge variant={ramaIsActive ? 'default' : 'secondary'} className="text-xs">{ramaEstado}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNavigateRama}
                  disabled={!ramaId}
                  title={!ramaId ? 'Esta rama no tiene un ID válido en el backend' : undefined}
                  className="h-8 w-8 p-0 bg-primary hover:bg-primary-hover text-white border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEditRama(rama)} className="h-8 w-8 p-0 bg-primary hover:bg-primary-hover text-white border-primary">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDeleteRama(rama)} 
                  className="h-8 w-8 p-0"
                  title="Eliminar rama"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <AccordionContent className="px-6 pb-4 pt-0 bg-gray-50/50">
              <div className="space-y-3 border-l-2 border-gray-200 pl-6 ml-2">
                {((rama.subgroups ?? rama.subramas) ?? []).length === 0 ? (
                  <div key={`no-subramas-${ramaKey}`} className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">Esta rama no tiene subramas</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateSubrama}
                      disabled={!ramaId}
                      title={!ramaId ? 'No se puede crear subrama porque la rama no tiene ID' : undefined}
                      className="text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Crear Nueva Subrama
                    </Button>
                  </div>
                ) : (
                  <div key={`subramas-${ramaKey}`}>
                    {((rama.subgroups ?? rama.subramas) ?? []).map((subrama, subIndex) => {
                      const subgroupId = [
                        subrama.subgroup_id,
                        subrama.id,
                      ]
                        .map((candidate) =>
                          typeof candidate === 'string'
                            ? candidate.trim()
                            : candidate !== undefined && candidate !== null
                              ? String(candidate)
                              : ''
                        )
                        .find((candidate) => candidate.length > 0) ?? '';
                      const subgroupKey = subgroupId || `subgrupo-${subIndex}`;
                      const subramaDisplayName = subrama.name ?? subrama.nombre ?? '';
                      const subramaEstado = subrama.estado ?? (subrama.status === 'active' ? 'activa' : 'inactiva');
                      const subramaIsActive = (subrama.estado !== undefined ? String(subrama.estado) === 'activa' : subrama.status === 'active');

                      const handleNavigateSubrama = () => {
                        if (!subgroupId) {
                          console.warn(' [RamaList] Intento de navegar a una subrama sin ID válido');
                          return;
                        }
                        navigate(`/app/organigrama/subrama/${subgroupId}`);
                      };

                      return (
                        <div key={`subrama-${ramaKey}-${subgroupKey}-${subIndex}`} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <Users className="h-4 w-4 text-secondary" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">Subrama: {subramaDisplayName}</span>
                                
                                {subramaEstado !== 'activa' ? (
                                  <Badge variant={subramaIsActive ? 'default' : 'secondary'} className="text-xs">{subramaEstado}</Badge>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleNavigateSubrama}
                              disabled={!subgroupId}
                              title={!subgroupId ? 'Esta subrama no tiene un ID válido en el backend' : undefined}
                              className="h-7 w-7 p-0 bg-primary hover:bg-primary-hover text-white border-primary disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onEditSubrama(subrama)} className="h-7 w-7 p-0 bg-primary hover:bg-primary-hover text-white border-primary">
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => onDeleteSubrama(subrama)} className="h-7 w-7 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <div key={`create-subrama-${ramaKey}`} className="pt-3 border-t border-gray-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateSubrama}
                        disabled={!ramaId}
                        title={!ramaId ? 'No se puede crear subrama porque la rama no tiene ID' : undefined}
                        className="w-full text-primary border-primary hover:bg-primary hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Crear Nueva Subrama
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}