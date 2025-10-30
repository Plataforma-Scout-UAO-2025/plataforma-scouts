import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { getAvailableMembers } from "@/api/guardiansApi";
import type { MemberBasicInfo } from "@/types/guardian.type";
import { Search, User, Users } from "lucide-react";

interface SelectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedMemberIds: number[]) => Promise<void>;
  isAdding: boolean;
}

// CORREGIR: Interfaz que agrega campos sin conflictos
interface ExtendedMemberInfo extends MemberBasicInfo {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  member_id?: number;    // Campo adicional como number
  id?: number;           // Campo adicional como number
  identification?: string;
  age?: number;
  role?: string;
  // No redefinir memberId ya que existe en MemberBasicInfo como string
}

export default function SelectMemberModal({
  isOpen,
  onClose,
  onConfirm,
  isAdding
}: SelectMemberModalProps) {
  const [availableMembers, setAvailableMembers] = useState<MemberBasicInfo[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberBasicInfo[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar miembros disponibles cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadAvailableMembers();
    }
  }, [isOpen]);

  // Filtrar miembros por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredMembers(availableMembers);
    } else {
      const filtered = availableMembers.filter((member) => {
        const memberData = member as ExtendedMemberInfo;
        const firstName = memberData.firstName || memberData.first_name || "";
        const lastName = memberData.lastName || memberData.last_name || "";
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const identification = memberData.identification || "";
        
        return fullName.includes(searchTerm.toLowerCase()) ||
               identification.includes(searchTerm);
      });
      setFilteredMembers(filtered);
    }
  }, [searchTerm, availableMembers]);

  const loadAvailableMembers = async () => {
    setLoading(true);
    try {
      const members = await getAvailableMembers();
      setAvailableMembers(members);
      setFilteredMembers(members);
    } catch (error) {
      console.error("❌ Error al cargar los miembros disponibles:", error);
      toast.error("Error al cargar los miembros disponibles");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberToggle = (memberId: number) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0) {
      toast.error("Por favor selecciona al menos un miembro");
      return;
    }

    console.log("🚀 Enviando miembros seleccionados:", selectedMemberIds);
    try {
      await onConfirm(selectedMemberIds);
      handleClose();
    } catch (error) {
      console.error("❌ Error adding members:", error);
    }
  };

  const handleClose = () => {
    setSelectedMemberIds([]);
    setSearchTerm("");
    setAvailableMembers([]);
    setFilteredMembers([]);
    onClose();
  };

  // CORREGIR: Función que maneja los diferentes tipos de ID
  const getMemberName = (member: MemberBasicInfo): string => {
    const memberData = member as ExtendedMemberInfo;
    const firstName = memberData.firstName || memberData.first_name || "Sin nombre";
    const lastName = memberData.lastName || memberData.last_name || "";
    return `${firstName} ${lastName}`.trim();
  };

  // CORREGIR: Función que convierte string ID a number si es necesario
  const getMemberId = (member: MemberBasicInfo): number => {
    const memberData = member as ExtendedMemberInfo;
    
    // Intentar obtener ID como number primero
    if (memberData.member_id && typeof memberData.member_id === 'number') {
      return memberData.member_id;
    }
    
    if (memberData.id && typeof memberData.id === 'number') {
      return memberData.id;
    }
    
    // Si memberId es string, convertirlo a number
    if (memberData.memberId && typeof memberData.memberId === 'string') {
      const numericId = parseInt(memberData.memberId, 10);
      if (!isNaN(numericId)) {
        return numericId;
      }
    }
    
    // Último recurso
    return 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Users size={24} />
            Seleccionar Miembros Disponibles
          </DialogTitle>
          <DialogDescription>
            Selecciona los miembros que no tienen guardian asignado para añadirlos a tu cargo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 py-4 min-h-0">
          {/* Buscador - Fijo en la parte superior */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de miembros con scroll habilitado */}
          <div className="flex-1 border rounded-lg overflow-hidden flex flex-col min-h-0">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-500">Cargando miembros...</p>
                </div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <User className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {searchTerm ? "No se encontraron miembros" : "No hay miembros disponibles"}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {!searchTerm && "Todos los miembros ya tienen guardian asignado"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-2">
                  {filteredMembers.map((member) => {
                    const memberId = getMemberId(member);
                    const memberData = member as ExtendedMemberInfo;
                    
                    return (
                      <div
                        key={memberId}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer hover:bg-gray-50 ${
                          selectedMemberIds.includes(memberId) 
                            ? 'bg-blue-50 border-blue-300' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => handleMemberToggle(memberId)}
                      >
                        <Checkbox
                          checked={selectedMemberIds.includes(memberId)}
                          onChange={() => handleMemberToggle(memberId)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {getMemberName(member)}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                ID: {memberId} • {memberData.identification || "Sin identificación"}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="text-xs text-gray-400">
                                {memberData.age ? `${memberData.age} años` : ""}
                              </p>
                              <p className="text-xs text-gray-400">
                                {memberData.role || ""}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Contador de seleccionados - Fijo en la parte inferior */}
          {selectedMemberIds.length > 0 && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded flex-shrink-0">
              <div className="flex items-center justify-between">
                <span>✅ {selectedMemberIds.length} miembro(s) seleccionado(s)</span>
                <span className="text-xs text-gray-500">
                  Total disponibles: {filteredMembers.length}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isAdding}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isAdding || selectedMemberIds.length === 0}
          >
            {isAdding ? "Añadiendo..." : `Añadir ${selectedMemberIds.length} miembro(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}