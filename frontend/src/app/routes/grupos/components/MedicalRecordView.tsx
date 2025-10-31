import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';
import MedicalWizardForm from '../medical-info/components/MedicalInfo';
import MedicalRecordsTable from './MedicalRecordTable';
import MedicalRecordsFilter from './MedicalRecordFilter';
import type { MedicalDB } from '@/types/medical-form.type';
import { useTenant } from '@/hooks/useTenant';
import type { Member } from '@/types/member.type';
import { getMedicalRecordsByTenantApi } from '@/api/medicalApi';
import { getMembers } from '@/api/membersApi';
import { useAuth0 } from '@auth0/auth0-react';
import { AlertCircle } from 'lucide-react';
import { useRoleContext } from '@/hooks/useRoleContext';

export default function MedicalRecordsView() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchFilter, setSearchFilter] = useState("");
    const [bloodTypeFilter, setBloodTypeFilter] = useState("");
    const [epsFilter, setEpsFilter] = useState("");
    const [allergiesFilter, setAllergiesFilter] = useState("");

    const tenantId = useTenant();
    const { user } = useAuth0();
    const { currentUserRole } = useRoleContext();

    // Verificar si el usuario es Scout
    const isScout = currentUserRole === 'Scout' || currentUserRole === 'SCOUT' || currentUserRole === 'scout';

    const fetchMedicalRecords = useCallback(async () => {
        if (!tenantId || !user) return;

        // Si es Scout, no hacer nada
        if (isScout) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Solo para líderes/admin: obtener todos los registros
            const response = await getMedicalRecordsByTenantApi(tenantId);

            // Obtener información de todos los miembros
            const membersMap = new Map<string, string>();
            const membersResponse = await getMembers();
            membersResponse.forEach((member: Member) => {
                if (member.status === 'APPROVED' && member.is_active) {
                    membersMap.set(
                        member.member_id?.toString() || "",
                        `${member.first_name} ${member.last_name}`
                    );
                }
            });

            // Adaptar registros médicos
            const adaptedRecords: MedicalRecord[] = response.content.map((record: MedicalDB) => {
                const recordMemberId = record.member_id;
                const memberName = membersMap.get(recordMemberId.toString()) || `Miembro ${recordMemberId}`;

                return {
                    id: record.id,
                    member_id: recordMemberId,
                    member_name: memberName,
                    blood_type: record.blood_type,
                    eps: record.eps,
                    allergies: record.allergies,
                    chronic_diseases: record.chronic_diseases,
                    physical_restrictions: record.physical_restrictions,
                    surgical_history: record.surgical_history,
                    active: record.active,
                    vaccines_detail: record.vaccines_detail?.map((vaccine) => ({
                        name: vaccine.name,
                        applied_at: vaccine.applied_at
                    })) || [],
                    medications_detail: record.medications_detail?.map((med) => ({
                        name: med.name,
                        dose: med.dose,
                        frequency: med.frequency
                    })) || [],
                    created_at: record.created_at,
                    updated_at: record.updated_at
                };
            });

            setRecords(adaptedRecords);
        } catch (err) {
            console.error('Error fetching medical records:', err);
            setError('Error al cargar los registros médicos');

        } finally {
            setIsLoading(false);
        }
    }, [tenantId, user, isScout]);

    useEffect(() => {
        fetchMedicalRecords();
    }, [fetchMedicalRecords]);

    const hasAllergies = (allergies: string) => {
        return allergies && allergies.trim().length > 0;
    };

    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            const matchesSearch = !searchFilter ||
                record.member_name.toLowerCase().includes(searchFilter.toLowerCase());

            const matchesBloodType = !bloodTypeFilter ||
                record.blood_type === bloodTypeFilter;

            const matchesEps = !epsFilter ||
                record.eps === epsFilter;

            const matchesAllergies = !allergiesFilter ||
                (allergiesFilter === "yes" && hasAllergies(record.allergies)) ||
                (allergiesFilter === "no" && !hasAllergies(record.allergies));

            return matchesSearch && matchesBloodType && matchesEps && matchesAllergies;
        });
    }, [records, searchFilter, bloodTypeFilter, epsFilter, allergiesFilter]);

    const handleCreate = () => {
        setEditingRecord(null);
        setShowForm(true);
    };

    const handleEdit = (record: MedicalRecord) => {
        setEditingRecord(record);
        setShowForm(true);
    };

    const handleFormSubmit = async () => {
        try {
            setShowForm(false);
            setEditingRecord(null);
            await fetchMedicalRecords();
        } catch (err) {
            console.error('Error refreshing medical records:', err);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingRecord(null);
    };

    // Si es Scout, mostrar mensaje de acceso denegado
    if (isScout) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Registros Médicos</h1>
                        <p className="text-muted-foreground">
                            Gestión de información médica
                        </p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                    <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-amber-900 mb-2">
                        Acceso Restringido
                    </h2>
                    <p className="text-amber-800 mb-4">
                        Esta sección está disponible solo para líderes y administradores del grupo.
                    </p>
                    <p className="text-sm text-amber-700">
                        Para consultar o actualizar tu información médica, contacta a tu jefe de grupo o líder de rama.
                    </p>
                </div>
            </div>
        );
    }

    if (showForm) {
        return (
            <MedicalWizardForm
                memberId={editingRecord?.member_id || 0}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                initialData={editingRecord || undefined}
            />
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Registros Médicos</h1>
                        <p className="text-muted-foreground">
                            Gestiona la información médica de los integrantes
                        </p>
                    </div>
                </div>
                <div className="text-center text-red-500 py-8">
                    {error}
                    <Button onClick={fetchMedicalRecords} className="ml-4">
                        Reintentar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Registros Médicos</h1>
                    <p className="text-muted-foreground">
                        Gestiona la información médica de los integrantes
                    </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    Nuevo Registro
                </Button>
            </div>

            <MedicalRecordsFilter
                searchFilter={searchFilter}
                setSearchFilter={setSearchFilter}
                bloodTypeFilter={bloodTypeFilter}
                setBloodTypeFilter={setBloodTypeFilter}
                epsFilter={epsFilter}
                setEpsFilter={setEpsFilter}
                allergiesFilter={allergiesFilter}
                setAllergiesFilter={setAllergiesFilter}
                records={records}
            />

            <MedicalRecordsTable
                records={filteredRecords}
                onEdit={handleEdit}
                isLoading={isLoading}
            />
        </div>
    );
}