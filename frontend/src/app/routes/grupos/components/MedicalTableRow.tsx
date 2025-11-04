import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Droplets, AlertTriangle, Eye, Edit, FileDown } from 'lucide-react'; // ← Agregamos FileDown
import type { MedicalRecord } from '../../../../types/medical-record.type';
import { useRoleContext } from '@/hooks/useRoleContext';

interface MedicalTableRowProps {
    record: MedicalRecord;
    onView: (record: MedicalRecord) => void;
    onEdit: (record: MedicalRecord) => void;
    onExport: (record: MedicalRecord) => void; // ← Nueva prop
}

export function MedicalTableRow({ record, onView, onEdit, onExport }: MedicalTableRowProps) {
    const { currentUserRole } = useRoleContext();
    const hasContent = (text: string) => text && text.trim().length > 0;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <TableRow key={record.id}>
            <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {record.member_name}
                </div>
            </TableCell>

            <TableCell>
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    <Droplets className="h-3 w-3" />
                    {record.blood_type}
                </Badge>
            </TableCell>

            <TableCell className="max-w-[150px] truncate">
                {record.eps}
            </TableCell>

            <TableCell>
                {hasContent(record.allergies) ? (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        Sí
                    </Badge>
                ) : (
                    <Badge variant="secondary">No</Badge>
                )}
            </TableCell>

            <TableCell>
                <Badge variant={record.vaccines_detail.length > 0 ? "default" : "secondary"}>
                    {record.vaccines_detail.length}
                </Badge>
            </TableCell>

            <TableCell>
                <Badge variant={record.medications_detail.length > 0 ? "default" : "secondary"}>
                    {record.medications_detail.length}
                </Badge>
            </TableCell>

            <TableCell>
                {formatDate(record.updated_at)}
            </TableCell>

            <TableCell>
                <div className="flex items-center justify-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(record)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Ver detalles"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>

                    {
                        currentUserRole === 'ADMIN_GLOBAL' ?
                        <></>
                        :
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(record)}
                            className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
                            title="Editar registro"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                    }

                    {/* Nuevo botón de exportar */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onExport(record)}
                        className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        title="Exportar PDF"
                    >
                        <FileDown className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}
