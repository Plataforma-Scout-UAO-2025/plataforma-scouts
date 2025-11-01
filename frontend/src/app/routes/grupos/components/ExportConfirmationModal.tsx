import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, AlertCircle } from 'lucide-react';

interface ExportConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    recordCount: number;
    isExporting?: boolean;
}

export function ExportConfirmationModal({
    open,
    onOpenChange,
    onConfirm,
    recordCount,
    isExporting = false
}: ExportConfirmationModalProps) {
    const handleConfirm = () => {
        onConfirm();
        // No cerramos el modal aquí, se cerrará cuando termine la exportación
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                            <Download className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Exportar Registros Médicos</DialogTitle>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <DialogDescription className="text-base">
                        Está a punto de exportar <span className="font-semibold text-foreground">{recordCount} registro{recordCount !== 1 ? 's' : ''} médico{recordCount !== 1 ? 's' : ''}</span> en un solo archivo PDF.
                    </DialogDescription>

                    <div className="bg-primary/10  rounded-lg p-4 space-y-2">
                        <div className="flex items-start gap-2">
                            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-primary">
                                <p className="font-medium mb-1">El archivo incluirá:</p>
                                <ul className="list-disc list-inside space-y-1 ml-1">
                                    <li>Información básica (nombre, tipo de sangre, EPS)</li>
                                    <li>Historial médico completo</li>
                                    <li>Vacunas y medicamentos</li>
                                    <li>Cada registro en una página separada</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {recordCount > 20 && (
                        <div className=" bg-primary/10 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-primary">
                                La exportación de muchos registros puede tomar algunos segundos. Por favor, espere.
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                        ¿Desea continuar con la exportación?
                    </p>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isExporting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isExporting}
                        className="gap-2"
                    >
                        {isExporting ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Exportando...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Exportar PDF
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}