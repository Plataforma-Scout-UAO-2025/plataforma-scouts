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
import type { Rama } from '../types/rama.type';

interface RamaListProps {
  ramas: Rama[];
  onEditRama: (rama: Rama) => void;
  onDeleteRama: (rama: Rama) => void;
  onCreateSubrama: (ramaId: string) => void;
  onEditSubrama: (subrama: any) => void;
  onDeleteSubrama: (subrama: any) => void;
}

export default function RamaList({
  ramas,
  onEditRama,
  onDeleteRama,
  onCreateSubrama,
  onEditSubrama,
  onDeleteSubrama,
}: RamaListProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['2']); // Inicia con la rama que tiene section_id = 2
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
      {ramas.map((rama) => (
        <AccordionItem 
          key={rama.section_id} 
          value={rama.section_id.toString()}
          className="border rounded-lg shadow-sm bg-white"
        >
          {/* Header con título y botones separados */}
          <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 rounded-t-lg">
            {/* Trigger del acordeón solo para el título */}
            <AccordionTrigger 
              className="flex-1 hover:no-underline [&>svg]:hidden p-0"
              onClick={() => handleToggleExpansion(rama.section_id.toString())}
            >
              <div className="flex items-center space-x-3">
                <ChevronDown 
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    expandedItems.includes(rama.section_id.toString()) ? 'rotate-180' : ''
                  }`}
                />
                <Users className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-foreground">
                      Rama: {rama.nombre}
                    </span>
                    <Badge 
                      variant={rama.estado === 'activa' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {rama.estado}
                    </Badge>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            {/* Botones de acción fuera del trigger */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Ver Rama */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('🔍 [RamaList] Navigating to rama with ID:', rama.id);
                  console.log('🔍 [RamaList] Full rama object:', rama);
                  navigate(`/app/organigrama/rama/${rama.id}`)
                }}
                className="h-8 w-8 p-0 bg-primary hover:bg-primary-hover text-white border-primary"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {/* Editar Rama */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditRama(rama)}
                className="h-8 w-8 p-0 bg-primary hover:bg-primary-hover text-white border-primary"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              {/* Eliminar Rama */}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDeleteRama(rama)}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AccordionContent className="px-6 pb-4 pt-0 bg-gray-50/50">
            <div className="space-y-3 border-l-2 border-gray-200 pl-6 ml-2">
              {rama.subramas.length === 0 ? (
                <div key={`no-subramas-${rama.section_id}`} className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Esta rama no tiene subramas
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('🔍 [RamaList] Creating subrama for rama ID:', rama.id);
                      console.log('🔍 [RamaList] Full rama object for subrama creation:', rama);
                      onCreateSubrama(rama.id);
                    }}
                    className="text-primary border-primary hover:bg-primary hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nueva Subrama
                  </Button>
                </div>
              ) : (
                <div key={`subramas-${rama.section_id}`}>
                  {rama.subramas.map((subrama, index) => (
                    <div
                      key={`subrama-${rama.section_id}-${subrama.id}-${index}`}
                      className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 shadow-sm"
                    >
                      {/* Contenido izquierdo de la subrama */}
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-secondary" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              Subrama: {subrama.nombre}
                            </span>
                            <Badge 
                              variant={subrama.estado === 'activa' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {subrama.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción de la subrama */}
                      <div className="flex items-center space-x-2">
                        {/* Ver Subrama */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log('🔍 [RamaList] Navigating to subrama with ID:', subrama.subgroup_id || subrama.id);
                            console.log('🔍 [RamaList] Full subrama object:', subrama);
                            navigate(`/app/organigrama/subrama/${subrama.subgroup_id || subrama.id}`)
                          }}
                          className="h-7 w-7 p-0 bg-primary hover:bg-primary-hover text-white border-primary"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {/* Editar Subrama */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditSubrama(subrama)}
                          className="h-7 w-7 p-0 bg-primary hover:bg-primary-hover text-white border-primary"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        {/* Eliminar Subrama */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteSubrama(subrama)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Botón para crear nueva subrama */}
                  <div key={`create-subrama-${rama.section_id}`} className="pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('🔍 [RamaList] Creating subrama for rama ID (from bottom):', rama.id);
                        console.log('🔍 [RamaList] Full rama object for subrama creation (from bottom):', rama);
                        onCreateSubrama(rama.id);
                      }}
                      className="w-full text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Nueva Subrama
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
