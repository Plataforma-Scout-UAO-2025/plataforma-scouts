import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';
import MedicalWizardForm from '../medical-info/components/MedicalInfo';
import MedicalRecordsTable from './MedicalRecordTable';
import MedicalRecordsFilter from './MedicalRecordFilter';
import type { MedicalDB, MedicalFormData } from '@/types/medical-form.type';
import { useTenant } from '@/hooks/useTenant';
import type { Member } from '@/types/member.type';
import { getMedicalRecordsByTenantApi } from '@/api/medicalApi';
import { getMembers } from '@/api/membersApi';

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

    const fetchMedicalRecords = useCallback(async () => {
        if (!tenantId) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await getMedicalRecordsByTenantApi(tenantId);

            const membersResponse = await getMembers();
            const membersMap = new Map<string, string>();

            membersResponse.forEach((member: Member) => {
                if (member.status === 'APPROVED' && member.is_active) {
                    membersMap.set(member.member_id?.toString() || "", `${member.first_name} ${member.last_name}`);
                }
            });

            const adaptedRecords: MedicalRecord[] = response.content.map((record: MedicalDB) => {
                const memberId = record.member_id;
                const memberName = membersMap.get(memberId.toString()) || `Miembro ${memberId}`;

                return {
                    id: record.id,
                    member_id: memberId,
                    member_name: memberName,
                    blood_type: record.blood_type,
                    eps: record.eps,
                    allergies: record.allergies,
                    chronic_diseases: record.chronic_diseases,
                    physical_restrictions: record.physical_restrictions,
                    surgical_history: record.surgical_history,
                    active: record.active,
                    vaccines_detail: record.vaccines_detail.map((vaccine) => ({
                        name: vaccine.name,
                        applied_at: vaccine.applied_at
                    })),
                    medications_detail: record.medications_detail.map((med) => ({
                        name: med.name,
                        dose: med.dose,
                        frequency: med.frequency
                    })),
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
    }, [tenantId]);

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

    
    const handleFormSubmit = async (formData: MedicalFormData) => {
        try {
            if (editingRecord) {
                setRecords(prev => prev.map(record =>
                    record.id === editingRecord.id
                        ? {
                            ...record,
                            ...formData,
                            updated_at: new Date().toISOString()
                        }
                        : record
                ));
            } else {
                const newRecord: MedicalRecord = {
                    ...formData,
                    id: Date.now(),
                    member_id: 0,
                    member_name: 'Nuevo Integrante',
                    active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                };
                setRecords(prev => [...prev, newRecord]);
            }

            setShowForm(false);
            setEditingRecord(null);
        } catch (err) {
            console.error('Error saving medical record:', err);
            alert('Error al guardar el registro médico');
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