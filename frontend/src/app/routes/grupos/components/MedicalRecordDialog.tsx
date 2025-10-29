import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Stethoscope, Shield, Pill, Droplet, Building2, Calendar, AlertCircle } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';

interface MedicalRecordDialogProps {
    record: MedicalRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MedicalRecordDialog({ record, open, onOpenChange }: MedicalRecordDialogProps) {
    if (!record) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const hasContent = (text: string) => text && text.trim().length > 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="space-y-3 pb-4 border-b border-border">
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <span className="text-primary font-bold">
                            {record.member_name}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        Registro médico completo y actualizado
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 pt-2">
                    {/* Información Básica */}
                    <Card className="border-primary/20  py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardHeader className="pb-3 pt-4 bg-primary">
                            <CardTitle className="text-lg flex items-center gap-2 text-white">
                                <User className="h-5 w-5 text-white" />
                                Información Básica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 pb-6 px-6"> {/* ← Agregar pt-6 */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Droplet className="h-4 w-4 text-destructive" />
                                    Tipo de Sangre
                                </div>
                                <Badge variant="secondary" className="text-base font-semibold px-3 py-1 bg-destructive/10 text-destructive border-destructive/20">
                                    {record.blood_type}
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    EPS
                                </div>
                                <p className="text-base font-medium text-foreground">{record.eps}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Calendar className="h-4 w-4 text-secondary" />
                                    Última Actualización
                                </div>
                                <p className="text-sm text-foreground">{formatDate(record.updated_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información Médica */}
                    <Card className="border-primary/20 py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardHeader className="pb-3 pt-4 bg-primary">
                            <CardTitle className="text-lg flex items-center gap-2 text-white">
                                <Stethoscope className="h-5 w-5 text-white" />
                                Información Médica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-5 pt-6 pb-6 px-6"> {/* ← Agregar pt-6 */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                    Alergias
                                </label>
                                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                                    <p className="text-sm text-foreground">
                                        {hasContent(record.allergies) ? record.allergies : 'Ninguna alergia registrada'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-destructive" />
                                    Enfermedades Crónicas
                                </label>
                                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                                    <p className="text-sm text-foreground">
                                        {hasContent(record.chronic_diseases) ? record.chronic_diseases : 'Ninguna enfermedad crónica registrada'}
                                    </p>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">
                                        Restricciones Físicas
                                    </label>
                                    <div className="p-3 bg-accent border border-border rounded-lg">
                                        <p className="text-sm text-foreground">
                                            {record.physical_restrictions || 'Ninguna restricción'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">
                                        Antecedentes Quirúrgicos
                                    </label>
                                    <div className="p-3 bg-accent border border-border rounded-lg">
                                        <p className="text-sm text-foreground">
                                            {record.surgical_history || 'Ningún antecedente'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vacunas */}
                    <Card className="border-primary/20 py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardHeader className="pb-3 pt-4 bg-primary">
                            <CardTitle className="text-lg flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-white" />
                                    Vacunas
                                </div>
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                    {record.vaccines_detail.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 pb-6 px-6"> {/* ← Agregar pt-6 */}
                            {record.vaccines_detail.length > 0 ? (
                                <div className="space-y-2">
                                    {record.vaccines_detail.map((vaccine, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
                                        >
                                            <span className="text-sm font-medium text-foreground">{vaccine.name}</span>
                                            <Badge variant="outline" className="text-xs text-primary border-primary/30">
                                                {formatDate(vaccine.applied_at)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-4 bg-muted border border-border rounded-lg">
                                    <Shield className="h-5 w-5 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground italic">No hay vacunas registradas</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Medicamentos */}
                    <Card className="border-primary/20 py-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardHeader className="pb-3 pt-4 bg-primary">
                            <CardTitle className="text-lg flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <Pill className="h-5 w-5 text-white" />
                                    Medicamentos
                                </div>
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                    {record.medications_detail.length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 pb-6 px-6"> {/* ← Agregar pt-6 */}
                            {record.medications_detail.length > 0 ? (
                                <div className="space-y-3">
                                    {record.medications_detail.map((med, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg hover:bg-secondary/10 transition-colors space-y-2"
                                        >
                                            <div className="font-semibold text-foreground flex items-center gap-2">
                                                <Pill className="h-4 w-4 text-secondary" />
                                                {med.name}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="font-medium text-muted-foreground">Dosis:</span>{' '}
                                                    <span className="text-foreground">{med.dose}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-muted-foreground">Frecuencia:</span>{' '}
                                                    <span className="text-foreground">{med.frequency}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 p-4 bg-muted border border-border rounded-lg">
                                    <Pill className="h-5 w-5 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground italic">No hay medicamentos registrados</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}