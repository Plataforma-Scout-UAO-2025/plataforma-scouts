import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
import { getAvailableMembers, getGuardianById } from "@/api/guardiansApi";
import type { MemberBasicInfo } from "@/types/guardian.type";
import { Search, User, Users, UserPlus } from "lucide-react";

interface SelectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedMemberIds: number[]) => Promise<void>;
  isAdding: boolean;
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
}

export default function SelectMemberModal({
  isOpen,
  onClose,
  onConfirm,
  isAdding,
}: SelectMemberModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  const [availableMembers, setAvailableMembers] = useState<MemberBasicInfo[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberBasicInfo[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [guardianMemberId, setGuardianMemberId] = useState<number | undefined>(undefined);

  const loadAvailableMembers = async () => {
    setLoading(true);
    try {
      const members = await getAvailableMembers();
      setAvailableMembers(members);
      setFilteredMembers(members);
    } catch (error) {
      console.error("Error al cargar los miembros disponibles: ", error);
      toast.error("Error al cargar los miembros disponibles");
    } finally {
      setLoading(false);
    }
  };

  const loadGuardianMemberId = async () => {
    try {
      const guardianId = user?.sub;
      
      if (guardianId) {
        const guardianData = await getGuardianById(guardianId);
        setGuardianMemberId(guardianData.member_id);
      }
    } catch (error) {
      console.error("Error al cargar el member_id del acudiente: ", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAvailableMembers();
      loadGuardianMemberId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (user?.sub) {
      loadGuardianMemberId();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const handleCreateScout = async () => {
    let memberId = guardianMemberId;
    
    if (!memberId) {
      const guardianId = user?.sub ? parseInt(user.sub.replace('auth0|', '')) : undefined;
      
      if (guardianId) {
        try {
          const guardianData = await getGuardianById(guardianId);
          memberId = guardianData.member_id;
        } catch {
          toast.error("Error al obtener la información del acudiente");
          return;
        }
      }
    }
    
    handleClose();
    
    navigate("/app/inscripcion", { 
      state: { 
        guardianMemberId: memberId,
        fromGuardianView: true 
      } 
    });
    
    toast.info("Completa el formulario para crear un nuevo scout");
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

    try {
      await onConfirm(selectedMemberIds);
      handleClose();
    } catch (error) {
      console.error("Error al añadir miembros: ", error);
    }
  };

  const handleClose = () => {
    setSelectedMemberIds([]);
    setSearchTerm("");
    setAvailableMembers([]);
    setFilteredMembers([]);
    onClose();
  };

  const getMemberName = (member: MemberBasicInfo): string => {
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

  return (
    <>
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
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Cargando miembros...</span>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                  <User size={48} className="mb-2 opacity-50" />
                  <p className="text-center">
                    {searchTerm ? "No se encontraron miembros" : "No hay miembros disponibles"}
                  </p>
                  {searchTerm && (
                    <p className="text-sm text-center mt-1">
                      Intenta con otros términos de búsqueda
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((member) => {
                    const memberId = getMemberId(member);
                    const memberName = getMemberName(member);
                    const memberData = member as ExtendedMemberInfo;
                    
                    return (
                      <div
                        key={memberId}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`member-${memberId}`}
                          checked={selectedMemberIds.includes(memberId)}
                          onCheckedChange={() => handleMemberToggle(memberId)}
                          disabled={isAdding}
                        />
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor={`member-${memberId}`}
                            className="block font-medium text-gray-900 cursor-pointer"
                          >
                            {memberName}
                          </label>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            {memberData.identification && (
                              <span>ID: {memberData.identification}</span>
                            )}
                            {memberData.age && (
                              <span>Edad: {memberData.age} años</span>
                            )}
                            {memberData.role && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {memberData.role}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedMemberIds.length > 0 && (
              <div className="flex-shrink-0 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{selectedMemberIds.length}</strong> miembro(s) seleccionado(s)
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-shrink-0">
            <div className="flex justify-between items-center w-full">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateScout}
                disabled={isAdding}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 flex items-center gap-2"
              >
                <UserPlus size={16} />
                Crear Scout
              </Button>

              <div className="flex gap-2">
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
                  onClick={handleSubmit}
                  disabled={isAdding || selectedMemberIds.length === 0}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {isAdding ? "Añadiendo..." : `Añadir ${selectedMemberIds.length} miembro(s)`}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}