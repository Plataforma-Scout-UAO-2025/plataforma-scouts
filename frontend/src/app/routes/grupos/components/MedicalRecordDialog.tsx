import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { User } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';
import { MedicalRecordInfo } from './MedicalRecordInfo';

interface MedicalRecordDialogProps {
    record: MedicalRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MedicalRecordDialog({ record, open, onOpenChange }: MedicalRecordDialogProps) {
    if (!record) return null;

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

                <MedicalRecordInfo record={record} />
                
            </DialogContent>
        </Dialog>
    );
}