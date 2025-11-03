import { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner";
import type { MemberBasicInfo } from "@/types/guardian.type";
import { Search, User, ArrowRight, Shield } from "lucide-react";

interface ReassignGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: number, newGuardianId: number) => Promise<void>;
  member: MemberBasicInfo | null;
  isReassigning: boolean;
}

// Interfaz para TODOS los guardianes del sistema
interface GuardianOption {
  guardianId: number;
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  identification?: string;
  phone?: string;
  email?: string;
  membersCount?: number;
  isCurrentGuardian?: boolean; // Para identificar el guardian actual
}

interface ExtendedMemberInfo extends MemberBasicInfo {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  member_id?: number;
  id?: number;
  identification?: string;
  age?: number;
  role?: string;
  guardianId?: number; // ID del guardian actual
}

export default function ReassignGuardianModal({
  isOpen,
  onClose,
  onConfirm,
  member,
  isReassigning
}: ReassignGuardianModalProps) {
  const [allGuardians, setAllGuardians] = useState<GuardianOption[]>([]);
  const [filteredGuardians, setFilteredGuardians] = useState<GuardianOption[]>([]);
  const [selectedGuardianId, setSelectedGuardianId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const loadAllGuardians = useCallback(async () => {
    setLoading(true);
    try {    
      const currentGuardianId = (member as ExtendedMemberInfo)?.guardianId;
      
      const mockGuardians: GuardianOption[] = [
        {
          guardianId: 1,
          firstName: "María",
          lastName: "González",
          identification: "12345678",
          phone: "300-123-4567",
          email: "maria.gonzalez@email.com",
          membersCount: 2,
          isCurrentGuardian: currentGuardianId === 1
        },
        {
          guardianId: 2,
          firstName: "Carlos",
          lastName: "Rodríguez", 
          identification: "87654321",
          phone: "301-987-6543",
          email: "carlos.rodriguez@email.com",
          membersCount: 1,
          isCurrentGuardian: currentGuardianId === 2
        },
        {
          guardianId: 3,
          firstName: "Ana",
          lastName: "Martínez",
          identification: "11223344",
          phone: "302-555-1234",
          email: "ana.martinez@email.com",
          membersCount: 3,
          isCurrentGuardian: currentGuardianId === 3
        },
        {
          guardianId: 4,
          firstName: "Pedro",
          lastName: "López",
          identification: "55667788",
          phone: "303-111-2222",
          email: "pedro.lopez@email.com",
          membersCount: 0,
          isCurrentGuardian: currentGuardianId === 4
        },
        {
          guardianId: 5,
          firstName: "Laura",
          lastName: "Hernández",
          identification: "99887766",
          phone: "304-333-4444",
          email: "laura.hernandez@email.com",
          membersCount: 4,
          isCurrentGuardian: currentGuardianId === 5
        }
      ];
      
      setAllGuardians(mockGuardians);
      setFilteredGuardians(mockGuardians);
    } catch (error) {
      console.error("Error al cargar los guardianes:", error);
      toast.error("Error al cargar los guardianes");
    } finally {
      setLoading(false);
    }
  }, [member]);

  // Cargar TODOS los guardianes cuando se abre el modal
  useEffect(() => {
    if (isOpen && member) {
      loadAllGuardians();
    }
  }, [isOpen, member, loadAllGuardians]);

  // Filtrar guardianes por búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGuardians(allGuardians);
    } else {
      const filtered = allGuardians.filter((guardian) => {
        const firstName = guardian.firstName || guardian.first_name || "";
        const lastName = guardian.lastName || guardian.last_name || "";
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const identification = guardian.identification || "";
        
        return fullName.includes(searchTerm.toLowerCase()) ||
               identification.includes(searchTerm);
      });
      setFilteredGuardians(filtered);
    }
  }, [searchTerm, allGuardians]);

  const handleGuardianSelect = (guardianId: number) => {
    // No permitir seleccionar el guardian actual
    const selectedGuardian = allGuardians.find(g => g.guardianId === guardianId);
    if (selectedGuardian?.isCurrentGuardian) {
      toast.warning("Este miembro ya está asignado a ese guardian");
      return;
    }
    setSelectedGuardianId(guardianId);
  };

  const handleSubmit = async () => {
    if (!selectedGuardianId) {
      toast.error("Por favor selecciona un guardian");
      return;
    }

    if (!member) {
      toast.error("No se encontró el miembro");
      return;
    }

    const memberId = getMemberId(member);
    if (!memberId) {
      toast.error("No se pudo identificar el miembro");
      return;
    }

    const selectedGuardian = allGuardians.find(g => g.guardianId === selectedGuardianId);
    if (selectedGuardian?.isCurrentGuardian) {
      toast.error("No puedes reasignar al mismo guardian");
      return;
    }
    
    try {
      await onConfirm(memberId, selectedGuardianId);
      handleClose();
    } catch (error) {
      console.error("Error reassigning guardian:", error);
    }
  };

  const handleClose = () => {
    setSelectedGuardianId(null);
    setSearchTerm("");
    setAllGuardians([]);
    setFilteredGuardians([]);
    onClose();
  };

  const getMemberName = (): string => {
    if (!member) return "Sin nombre";
    const memberData = member as ExtendedMemberInfo;
    const firstName = memberData.firstName || memberData.first_name || "Sin nombre";
    const lastName = memberData.lastName || memberData.last_name || "";
    return `${firstName} ${lastName}`.trim();
  };

  const getMemberId = (member: MemberBasicInfo): number => {
    const memberData = member as ExtendedMemberInfo;
    
    if (memberData.member_id && typeof memberData.member_id === 'number') {
      return memberData.member_id;
    }
    
    if (memberData.id && typeof memberData.id === 'number') {
      return memberData.id;
    }
    
    if (memberData.memberId && typeof memberData.memberId === 'string') {
      const numericId = parseInt(memberData.memberId, 10);
      if (!isNaN(numericId)) {
        return numericId;
      }
    }
    
    return 0;
  };

  const getGuardianName = (guardian: GuardianOption): string => {
    const firstName = guardian.firstName || guardian.first_name || "Sin nombre";
    const lastName = guardian.lastName || guardian.last_name || "";
    return `${firstName} ${lastName}`.trim();
  };

  // Función para obtener el color del badge según la cantidad de miembros
  const getMemberCountBadge = (count: number, isCurrentGuardian: boolean) => {
    if (isCurrentGuardian) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (count === 0) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (count <= 2) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
            <Shield size={24} />
            Reasignar Guardian
          </DialogTitle>
          <DialogDescription>
            Selecciona un nuevo guardian para <strong>{getMemberName()}</strong> de la lista completa de guardianes registrados en el sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col space-y-4 py-4 min-h-0">
          {/* Información del miembro */}
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded flex-shrink-0">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <span className="font-medium">Miembro a reasignar:</span> {getMemberName()}
                {member && (member as ExtendedMemberInfo).age && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({(member as ExtendedMemberInfo).age} años)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar guardian por nombre o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de TODOS los guardianes */}
          <div className="flex-1 border rounded-lg overflow-hidden flex flex-col min-h-0">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-gray-500">Cargando guardianes...</p>
                </div>
              </div>
            ) : filteredGuardians.length === 0 ? (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {searchTerm ? "No se encontraron guardianes" : "No hay guardianes registrados"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-2">
                  {filteredGuardians.map((guardian) => (
                    <div
                      key={guardian.guardianId}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        guardian.isCurrentGuardian
                          ? 'bg-blue-50 border-blue-300 cursor-not-allowed opacity-75'
                          : selectedGuardianId === guardian.guardianId
                          ? 'bg-green-50 border-green-300 cursor-pointer hover:bg-green-100' 
                          : 'border-gray-200 cursor-pointer hover:bg-gray-50'
                      }`}
                      onClick={() => !guardian.isCurrentGuardian && handleGuardianSelect(guardian.guardianId)}
                    >
                      {/* Radio button visual */}
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        guardian.isCurrentGuardian
                          ? 'bg-blue-100 border-blue-300'
                          : selectedGuardianId === guardian.guardianId
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedGuardianId === guardian.guardianId && !guardian.isCurrentGuardian && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                        {guardian.isCurrentGuardian && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {getGuardianName(guardian)}
                              </p>
                              {guardian.isCurrentGuardian && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Guardian Actual
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              ID: {guardian.guardianId} • {guardian.identification || "Sin identificación"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {guardian.phone && `Tel: ${guardian.phone}`}
                              {guardian.email && ` • ${guardian.email}`}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0 ml-4">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getMemberCountBadge(guardian.membersCount || 0, guardian.isCurrentGuardian || false)}`}>
                              {guardian.membersCount || 0} miembro{(guardian.membersCount || 0) !== 1 ? 's' : ''}
                            </div>
                            {selectedGuardianId === guardian.guardianId && !guardian.isCurrentGuardian && (
                              <div className="flex items-center gap-1 text-green-600 mt-1">
                                <ArrowRight size={12} />
                                <span className="text-xs font-medium">Seleccionado</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirmación */}
          {selectedGuardianId && (
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded flex-shrink-0">
              <div className="flex items-center justify-between">
                <span>Guardian seleccionado para reasignación</span>
                <span className="text-xs text-gray-500">
                  {getGuardianName(filteredGuardians.find(g => g.guardianId === selectedGuardianId)!)}
                </span>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex-shrink-0">
            <div className="flex items-center justify-between">
              <span>Total de guardianes: {allGuardians.length}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isReassigning}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isReassigning || !selectedGuardianId}
          >
            {isReassigning ? "Reasignando..." : "Confirmar Reasignación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}