import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';
import MedicalWizardForm from '../medical-info/components/MedicalInfo';
import MedicalRecordsTable from './MedicalRecordTable';
import type { MedicalFormData } from '../../../../types/medical-form.type';
import { useTenant } from '@/hooks/useTenant';
import api from '@/api/axios';
import type { Member } from '@/types/member.type';

// Interface para la respuesta de la API
interface ApiMedicalRecord {
    id: string;
    member_id: string;
    blood_type: string;
    eps: string;
    allergies: string;
    chronic_diseases: string;
    physical_restrictions: string;
    surgical_history: string;
    vaccines_detail: Array<{
        name: string;
        applied_at: string;
    }>;
    medications_detail: Array<{
        name: string;
        frequency: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    content: ApiMedicalRecord[];
}

export default function MedicalRecordsView() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { tenantId } = useTenant();

    // Busca esta función y reemplázala:
    const fetchMedicalRecords = useCallback(async () => {
        if (!tenantId) return;

        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get<ApiResponse>('http://localhost:8080/api/v1/medical_record/list_by_tenant', {
                headers: {
                    'X-Tenant-Id': tenantId
                },
                params: {
                    page: 0,
                    size: 50
                }
            });

            // PRIMERO: Cargar los miembros para tener los nombres
            const membersResponse = await api.get('/members/list_members');
            const membersMap = new Map();

            membersResponse.data.forEach((member: Member) => {
                if (member.status === 'APPROVED' && member.is_active !== false) {
                    membersMap.set(member.member_id, `${member.first_name} ${member.last_name}`);
                }
            });

            const adaptedRecords: MedicalRecord[] = response.data.content.map((record: ApiMedicalRecord) => {
                const memberId = parseInt(record.member_id);
                const memberName = membersMap.get(memberId) || `Miembro ${memberId}`;

                return {
                    id: parseInt(record.id),
                    member_id: memberId,
                    member_name: memberName, // ¡AQUÍ ESTÁ EL NOMBRE REAL!
                    blood_type: record.blood_type,
                    eps: record.eps,
                    allergies: record.allergies,
                    chronic_diseases: record.chronic_diseases,
                    physical_restrictions: record.physical_restrictions,
                    surgical_history: record.surgical_history,
                    vaccines_detail: record.vaccines_detail.map((vaccine) => ({
                        name: vaccine.name,
                        date: vaccine.applied_at
                    })),
                    medications_detail: record.medications_detail.map((med) => ({
                        name: med.name,
                        dose: '',
                        frecuency: med.frequency
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

    const handleCreate = () => {
        setEditingRecord(null);
        setShowForm(true);
    };

    const handleEdit = (record: MedicalRecord) => {
        setEditingRecord(record);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de que desea eliminar este registro médico?')) {
            return;
        }

        try {
            setRecords(prev => prev.filter(record => record.id !== id));
        } catch (err) {
            console.error('Error deleting medical record:', err);
            alert('Error al eliminar el registro médico');
        }
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

            <MedicalRecordsTable
                records={records}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
            />
        </div>
    );
}