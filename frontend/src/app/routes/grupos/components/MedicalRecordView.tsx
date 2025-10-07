import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { MedicalRecord } from '../types/medical-record';
import MedicalWizardForm from '../medical-info/components/MedicalInfo';
import MedicalRecordsTable from './MedicalRecordTable';
import type { MedicalFormData } from '../medical-info/types/medical-form';

interface MedicalRecordsViewProps {
    groupId: number;
}

export default function MedicalRecordsView({ groupId }: MedicalRecordsViewProps) {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

    // Datos de ejemplo (reemplazar con API real)
    const mockRecords: MedicalRecord[] = [
        {
            id: 1,
            member_id: 123,
            member_name: 'Juan Pérez',
            blood_type: 'O+',
            eps: 'Salud Total',
            allergies: 'Penicilina, Mariscos',
            chronic_diseases: 'Asma',
            physical_restrictions: 'Ninguna',
            surgical_history: 'Apendicectomía en 2018',
            vaccines_detail: [
                { name: 'COVID-19 (Pfizer)', date: '2022-04-23T18:25:43.511Z' },
                { name: 'Influenza', date: '2023-10-15T18:25:43.511Z' }
            ],
            medications_detail: [
                { name: 'Salbutamol', dose: '100 mcg', frecuency: 'Cuando sea necesario' }
            ],
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
        }
    ];

    const handleCreate = () => {
        setEditingRecord(null);
        setShowForm(true);
    };

    const handleEdit = (record: MedicalRecord) => {
        setEditingRecord(record);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Está seguro de que desea eliminar este registro médico?')) {
            setRecords(prev => prev.filter(record => record.id !== id));
        }
    };

    const handleFormSubmit = (formData: MedicalFormData) => {
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
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                member_name: 'Nuevo Integrante' // Esto vendría de la API
            };
            setRecords(prev => [...prev, newRecord]);
        }
        setShowForm(false);
        setEditingRecord(null);
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Registros Médicos - Grupo {groupId}</h1>
                    <p className="text-muted-foreground">
                        Gestiona la información médica de los integrantes del grupo scout
                    </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Registro
                </Button>
            </div>

            <MedicalRecordsTable
                records={records.length > 0 ? records : mockRecords}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={false}
            />
        </div>
    );
}