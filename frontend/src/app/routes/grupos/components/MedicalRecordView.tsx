import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import type { AxiosError } from 'axios'; 
import type { MedicalRecord } from '../../../../types/medical-record.type';
import MedicalWizardForm from '../medical-info/components/MedicalInfo';
import MedicalRecordsTable from './MedicalRecordTable';
import MedicalRecordsFilter from './MedicalRecordFilter';
import type { MedicalDB } from '@/types/medical-form.type';
import { useTenant } from '@/hooks/useTenant';
import type { Member } from '@/types/member.type';
import { getMedicalRecordApi, getMedicalRecordsByTenantApi } from '@/api/medicalApi';
import { getMembersWithBranch } from '@/api/membersApi';
import { useAuth0 } from '@auth0/auth0-react';
import { AlertCircle } from 'lucide-react';
import { useRoleContext } from '@/hooks/useRoleContext';
import { toast } from 'sonner';
import { useMassExportPDF } from '../hooks/useMedicalRecordPDF';
import { ExportConfirmationModal } from './ExportConfirmationModal';
import { MedicalRecordInfo } from './MedicalRecordInfo';

export default function MedicalRecordsView() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);

    const [searchFilter, setSearchFilter] = useState("");
    const [bloodTypeFilter, setBloodTypeFilter] = useState("");
    const [epsFilter, setEpsFilter] = useState("");
    const [allergiesFilter, setAllergiesFilter] = useState("");
    const { exportAllToPDF } = useMassExportPDF();
    const tenantId = useTenant();
    const { user } = useAuth0();
    const { currentUserRole } = useRoleContext();

    const addNameToMedicalRecord = (record: MedicalDB, membersMap: Map<string, string>) => {
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
    }

    const fetchMedicalRecords = useCallback(async () => {
        if (!tenantId || !user) return;

        try {
            setIsLoading(true);
            setError(null);

            const membersMap = new Map<string, string>();

            let membersResponse: Member[] = [];
            let medicalResponse;
            let currentMember: Member | undefined;
            let currentMemberId: number | undefined;

            let scoutMembers: Member[] = [];
            let scoutRecords: MedicalDB[] = [];
            let filteredMedicalRecords: MedicalDB[] = [];
            let adaptedRecords: MedicalRecord[] = [];
            const medicalFetch: MedicalDB[][] = [];
            const allTenants: Set<string> = new Set();

            switch (currentUserRole) {
                case 'SCOUT':
                    membersResponse = await getMembersWithBranch();
                    currentMember = membersResponse.find((member: Member) =>
                        member.email?.toLowerCase() === user?.email?.toLowerCase()
                    );

                    currentMemberId = currentMember?.memberId

                    try {
                        medicalResponse = await getMedicalRecordApi(currentMemberId || 0, tenantId);

                        if (medicalResponse) {
                            adaptedRecords = [addNameToMedicalRecord(medicalResponse, membersMap)];
                            setRecords(adaptedRecords);
                        } else {
                            setRecords([]);
                        }
                    } catch (err: unknown) {
                        if ((err as AxiosError).response?.status === 500) {
                            // No hay registro médico todavía
                            medicalResponse = null;
                        } else {
                            throw err;
                        }
                    }

                    break;


                case 'ACUDIENTE':
                    // Si es acudiente, no hacer nada
                    break;

                case 'SCOUTER':
                    // Solo para líderes/admin: obtener todos los registros
                    medicalResponse = await getMedicalRecordsByTenantApi(tenantId);

                    // Obtener información de todos los miembros
                    membersResponse = await getMembersWithBranch();

                    currentMember = membersResponse.find((member: Member) =>
                        member.email?.toLowerCase() === user?.email?.toLowerCase()
                    );

                    scoutMembers = membersResponse.filter(
                        (member: Member) =>
                            member.tenantId === tenantId);

                    if (currentMember?.subgroup?.section?.groupId) {

                        scoutMembers = scoutMembers.filter(
                            (member: Member) =>
                                member.subgroup?.section?.groupId === currentMember?.subgroup?.section?.groupId);

                        if (currentMember?.subgroup?.sectionId) {
                            scoutMembers = scoutMembers.filter(
                                (member: Member) =>
                                    member.subgroup?.sectionId === currentMember?.subgroup?.sectionId);
                        }
                    }

                    scoutMembers.forEach((member: Member) => {
                        if (member.role?.toUpperCase() !== 'DEV_SUPPORT' && 
                            member.role?.toUpperCase() !== 'ADMIN_GLOBAL' && 
                            member.status === 'APPROVED' && member.isActive) {
                            membersMap.set(
                                member.memberId?.toString() || "",
                                `${member.firstName} ${member.lastName}`
                            );
                        }
                    });

                    filteredMedicalRecords = medicalResponse.content.filter(
                        (record: MedicalDB) =>
                            membersMap.has(record.member_id.toString())
                    );

                    // Adaptar registros médicos
                    adaptedRecords = filteredMedicalRecords.map((record: MedicalDB) => { return addNameToMedicalRecord(record, membersMap) });
                    setRecords(adaptedRecords);
                    break;

                case 'ADMIN_GRUPO':
                    // Solo para líderes/admin: obtener todos los registros
                    medicalResponse = await getMedicalRecordsByTenantApi(tenantId);

                    // Obtener información de todos los miembros
                    membersResponse = await getMembersWithBranch();

                    currentMember = membersResponse.find((member: Member) =>
                        member.email?.toLowerCase() === user?.email?.toLowerCase()
                    );

                    scoutMembers = membersResponse.filter(
                        (member: Member) =>
                            member.tenantId === tenantId);

                    if (currentMember?.subgroup?.section?.groupId) {
                        scoutMembers = scoutMembers.filter(
                            (member: Member) =>
                                member.subgroup?.section?.groupId === currentMember?.subgroup?.section?.groupId);
                    }

                    scoutMembers.forEach((member: Member) => {
                        if (member.role?.toUpperCase() !== 'DEV_SUPPORT' && 
                            member.role?.toUpperCase() !== 'ADMIN_GLOBAL' && 
                            member.status === 'APPROVED' && member.isActive) {
                            membersMap.set(
                                member.memberId?.toString() || "",
                                `${member.firstName} ${member.lastName}`
                            );
                        }
                    });

                    filteredMedicalRecords = medicalResponse.content.filter(
                        (record: MedicalDB) =>
                            membersMap.has(record.member_id.toString())
                    );

                    // Adaptar registros médicos
                    adaptedRecords = filteredMedicalRecords.map((record: MedicalDB) => { return addNameToMedicalRecord(record, membersMap) });
                    setRecords(adaptedRecords);
                    break;

                case 'ADMIN_GLOBAL':
                    // Obtener información de todos los miembros
                    scoutMembers = await getMembersWithBranch();

                    // por cada miembro, se obtiene el tenant sin repetir
                    scoutMembers.forEach(member => {
                        allTenants.add(member.tenantId || '');
                    });

                    allTenants.delete(tenantId);

                    // por cada tenant, se añaden registros médicos de cada uno de los tenants
                    allTenants.forEach(async tenant => {
                        medicalFetch.push( [...(await getMedicalRecordsByTenantApi(tenant)).content] );
                    });

                    // Parece redundante, pero sin esto no carga los registros médicos
                    medicalFetch.push((await getMedicalRecordsByTenantApi(tenantId)).content);

                    // y luego se concadenan todos
                    medicalFetch.forEach(medicalTenant => {
                        scoutRecords = [...scoutRecords, ...medicalTenant];
                    });

                    // por cada miembro
                    scoutMembers.forEach((member: Member) => {
                        // si son miembros scouts aprobados y activos...
                        if (member.role?.toUpperCase() !== 'DEV_SUPPORT' && 
                            member.role?.toUpperCase() !== 'ADMIN_GLOBAL' && 
                            member.status === 'APPROVED' && member.isActive) {
                            // se añade su nombre al mapeo de nombres por id
                            membersMap.set(
                                member.memberId?.toString() || "",
                                `${member.firstName} ${member.lastName}`
                            );
                        }
                    });

                    // se filtran los registros médicos con base a si su id se encuentra en el mapeo de nombres
                    // (evita bugs al integrar la lista de registros médicos y la lista de miembros en la tabla)
                    filteredMedicalRecords = scoutRecords.filter(
                        (record: MedicalDB) =>
                            membersMap.has(record.member_id.toString())
                    );

                    // Adaptar los registros médicos para que tengan los nombres anteriormente capturados
                    adaptedRecords = filteredMedicalRecords.map((record: MedicalDB) => { return addNameToMedicalRecord(record, membersMap) });
                    setRecords(adaptedRecords);
                    break;
            }
        } catch (err) {
            console.error('Error fetching medical records:', err);
            setError('Error al cargar los registros médicos');

        } finally {
            setIsLoading(false);
        }
    }, [tenantId, user, currentUserRole]);

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
    const handleMassExport = async () => {
        if (filteredRecords.length === 0) {
            toast.error("No hay registros médicos para exportar",);
            return;
        }

        setIsExporting(true);

        try {
            await exportAllToPDF(filteredRecords);
            toast.success(
                `Se han exportado ${filteredRecords.length} registro(s) médico(s) a PDF`
            );

            setShowExportModal(false);

        } catch (error) {
            console.error('Error en exportación masiva:', error);
            toast.error("No se pudo generar el PDF con los registros"
            );
        } finally {
            setIsExporting(false);
        }
    };

    switch (currentUserRole) {
        case 'SCOUT':
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Registros Médicos</h1>
                            <p className="text-muted-foreground">
                                Visualización de información médica
                            </p>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Cargando información médica...</p>
                        </div>
                    ) : !records[0] ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
                            <AlertCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-amber-900 mb-2">Atención</h2>
                            <p className="text-amber-800 mb-4">
                                No tienes creado un registro de información médica todavía.
                            </p>
                            <p className="text-sm text-amber-700">
                                Para actualizar la información médica, contacta con el jefe de grupo o líder de rama a la que perteneces.
                            </p>
                        </div>
                    ) : (
                        <MedicalRecordInfo record={records[0]} />
                    )}

                </div>
            );

        case 'ACUDIENTE':
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
                            Atención
                        </h2>
                        <p className="text-amber-800 mb-4">
                            La edición de información médica es manejada por los jefes de grupo y lideres de rama.
                        </p>
                        <p className="text-sm text-amber-700">
                            Para actualizar la información médica, contacta con el jefe de grupo o líder de rama a la que perteneces.
                        </p>
                    </div>
                </div>
            );

        case 'SCOUTER':
        case 'ADMIN_GRUPO':
        case 'ADMIN_GLOBAL':
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Registros Médicos</h1>
                            <p className="text-muted-foreground">
                                Gestiona la información médica de los integrantes
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowExportModal(true)}
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={isLoading || isExporting || filteredRecords.length === 0}
                            >
                                <Download className="h-4 w-4" />
                                {isExporting ? 'Exportando...' : 'Exportar Todo'}
                            </Button>
                            <Button
                                onClick={handleCreate}
                                className="flex items-center gap-2"
                                disabled={isLoading}
                            >
                                <Plus className="h-4 w-4" />
                                Nuevo Registro
                            </Button>
                        </div>
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
                    <ExportConfirmationModal
                        open={showExportModal}
                        onOpenChange={setShowExportModal}
                        onConfirm={handleMassExport}
                        recordCount={filteredRecords.length}
                        isExporting={isExporting}
                    />
                </div>

            );
    }
}
