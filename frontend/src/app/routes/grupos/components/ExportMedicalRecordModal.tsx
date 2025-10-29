import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown, Download } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';
import { useMedicalRecordPDF } from '../hooks/useMedicalRecordPDF';

interface ExportMedicalRecordModalProps {
    record: MedicalRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onExportSuccess?: () => void;
}

export function ExportMedicalRecordModal({
    record,
    open,
    onOpenChange,
    onExportSuccess
}: ExportMedicalRecordModalProps) {
    const { exportToPDF } = useMedicalRecordPDF();

    if (!record) return null;

    const handleExport = async () => {
        try {
            await exportToPDF(record);
            onExportSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error en exportación:', error);
            alert('Error al exportar el PDF. Por favor, intente nuevamente.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                            <FileDown className="h-5 w-5 text-white" />
                        </div>
                        <DialogTitle>Exportar Registro Médico</DialogTitle>
                    </div>
                    <DialogDescription>
                        ¿Desea exportar el registro médico de{' '}
                        <span className="font-semibold text-foreground">
                            {record.member_name}
                        </span>
                        {' '}a formato PDF?
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm space-y-2">
                        <p><span className="font-medium">Integrante:</span> {record.member_name}</p>
                        <p><span className="font-medium">Tipo de sangre:</span> {record.blood_type}</p>
                        <p><span className="font-medium">EPS:</span> {record.eps}</p>
                        <p><span className="font-medium">Vacunas:</span> {record.vaccines_detail.length}</p>
                        <p><span className="font-medium">Medicamentos:</span> {record.medications_detail.length}</p>
                    </div>
                </div>

                <DialogDescription className="text-primary font-bold">
                    El PDF incluirá toda la información médica del integrante en un formato organizado y profesional.
                </DialogDescription>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleExport}
                        className="flex items-center gap-2 "
                    >
                        <Download className="h-4 w-4" />
                        Exportar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}