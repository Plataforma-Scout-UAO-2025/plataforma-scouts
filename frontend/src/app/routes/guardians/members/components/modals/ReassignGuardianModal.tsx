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
import { getAvailableGuardians } from "@/api/guardiansApi";
import { Search, User, ArrowRight, Shield } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

interface ReassignGuardianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: number, newGuardianId: number, currentGuardianId: number) => Promise<void>;
  member: MemberBasicInfo | null;
  isReassigning: boolean;
}

interface GuardianOption {
  guardianId: number;
  firstName: string;
  lastName: string;
  identification: string;
  phone?: string;
  email?: string;
  membersCount?: number;
  isCurrentGuardian?: boolean;
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
  guardianId?: number;
}

// Tipo para los datos de la API
interface GuardianApiResponse {
  member_id?: number;
  guardianId?: number;
  id?: number;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  identification?: string;
  phone?: string;
  email?: string;
  membersCount?: number;
}

export default function ReassignGuardianModal({
  isOpen,
  onClose,
  onConfirm,
  member,
  isReassigning
}: ReassignGuardianModalProps) {
  const { user } = useAuth0();
  const [allGuardians, setAllGuardians] = useState<GuardianOption[]>([]);
  const [filteredGuardians, setFilteredGuardians] = useState<GuardianOption[]>([]);
  const [selectedGuardianId, setSelectedGuardianId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const getCurrentGuardianId = (): number => {
    return user?.sub ? parseInt(user.sub.replace('auth0|', '')) : 0;
  };

  const loadAllGuardians = useCallback(async () => {
    setLoading(true);
    try {
      const guardiansData = await getAvailableGuardians();
      if (!guardiansData || !Array.isArray(guardiansData)) {
        throw new Error("Datos inválidos recibidos de la API");
      }
      
      const currentGuardianId = getCurrentGuardianId();
      
      const formattedGuardians: GuardianOption[] = guardiansData.map((item: GuardianApiResponse, index: number) => {
        
        return {
          guardianId: item.member_id || item.guardianId || item.id || index + 1,
          firstName: item.first_name || item.firstName || "Sin nombre",
          lastName: item.last_name || item.lastName || "Sin apellido", 
          identification: item.identification || "Sin identificación",
          phone: item.phone || undefined,
          email: item.email || undefined,
          membersCount: item.membersCount || 0,
          isCurrentGuardian: currentGuardianId === (item.member_id || item.guardianId || item.id)
        };
      });
      
      
      const validGuardians = formattedGuardians.filter(guardian => 
        guardian.firstName !== "Sin nombre" && 
        guardian.lastName !== "Sin apellido" &&
        guardian.guardianId > 0
      );
      
      
      setAllGuardians(validGuardians);
      setFilteredGuardians(validGuardians);
      
    } catch (error) {
      console.error("Error loading all guardians:", error);
      toast.error("Error al cargar los guardianes");
      
      setAllGuardians([]);
      setFilteredGuardians([]);
    } finally {
      setLoading(false);
    }
  }, [user?.sub]);
  

  useEffect(() => {
    if (isOpen && member) {
      loadAllGuardians();
    }
  }, [isOpen, member, loadAllGuardians]); 

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredGuardians(allGuardians);
    } else {
      const filtered = allGuardians.filter((guardian) => {
        const fullName = `${guardian.firstName} ${guardian.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
               guardian.identification.includes(searchTerm);
      });
      setFilteredGuardians(filtered);
    }
  }, [searchTerm, allGuardians]);

  const handleGuardianSelect = (guardianId: number) => {
    const selectedGuardian = allGuardians.find(g => g.guardianId === guardianId);
    if (selectedGuardian?.isCurrentGuardian) {
      toast.warning("Este miembro ya está asignado a este guardian");
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
    const currentGuardianId = getCurrentGuardianId();
    
    if (!memberId || !currentGuardianId) {
      toast.error("Error: IDs inválidos");
      return;
    }
  
    if (currentGuardianId === selectedGuardianId) {
      toast.error("El guardian actual y el nuevo son el mismo");
      return;
    }
  
    try {
      await onConfirm(memberId, selectedGuardianId, currentGuardianId);
      handleClose();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'message' in error) {
        toast.error((error as Error).message);
      } else {
        toast.error("Ocurrió un error desconocido");
      }
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
    return `${guardian.firstName} ${guardian.lastName}`.trim();
  };

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
                <div className="text-xs text-gray-500 mt-1">
                  Guardian actual: {user?.name} (ID: {getCurrentGuardianId()})
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar guardian por nombre o identificación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

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
                  <p className="text-xs text-gray-400 mt-2">
                    Total de registros recibidos: {allGuardians.length}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-2">
                  {filteredGuardians.map((guardian) => (
                    <div
                      key={`guardian-${guardian.guardianId}`}
                      className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                        guardian.isCurrentGuardian
                          ? 'bg-blue-50 border-blue-300 cursor-not-allowed opacity-75'
                          : selectedGuardianId === guardian.guardianId
                          ? 'bg-green-50 border-green-300 cursor-pointer hover:bg-green-100' 
                          : 'border-gray-200 cursor-pointer hover:bg-gray-50'
                      }`}
                      onClick={() => !guardian.isCurrentGuardian && handleGuardianSelect(guardian.guardianId)}
                    >
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
                              ID: {guardian.guardianId} • {guardian.identification}
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

          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex-shrink-0">
            <div className="flex items-center justify-between">
              <span>Total de guardianes: {allGuardians.length}</span>
              <span>Mostrando: {filteredGuardians.length}</span>
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