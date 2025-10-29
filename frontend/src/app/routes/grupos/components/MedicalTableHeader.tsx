import { TableHead, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortColumn = 'member_name' | 'blood_type' | 'eps' | 'allergies' | 'vaccines' | 'medications' | 'updated_at';
type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps {
    column: SortColumn;
    currentSort: SortColumn;
    direction: SortDirection;
    onSort: (column: SortColumn) => void;
    children: React.ReactNode;
}

function SortableHeader({ column, currentSort, direction, onSort, children }: SortableHeaderProps) {
    const getSortIcon = () => {
        if (currentSort !== column) {
            return <ArrowUpDown className="h-4 w-4 ml-1" />;
        }
        return direction === 'asc'
            ? <ArrowUp className="h-4 w-4 ml-1" />
            : <ArrowDown className="h-4 w-4 ml-1" />;
    };

    return (
        <TableHead className="cursor-pointer hover:bg-muted/50 select-none">
            <Button
                variant="ghost"
                onClick={() => onSort(column)}
                className="h-auto p-0 font-semibold hover:bg-transparent"
            >
                <div className="flex items-center">
                    {children}
                    {getSortIcon()}
                </div>
            </Button>
        </TableHead>
    );
}

interface MedicalTableHeadersProps {
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    onSort: (column: SortColumn) => void;
}

export function MedicalTableHeaders({ sortColumn, sortDirection, onSort }: MedicalTableHeadersProps) {
    return (
        <TableRow>
            <SortableHeader column="member_name" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                Integrante
            </SortableHeader>
            <SortableHeader column="blood_type" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                Tipo Sangre
            </SortableHeader>
            <SortableHeader column="eps" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                EPS
            </SortableHeader>
            <SortableHeader column="allergies" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                Alergias
            </SortableHeader>
            <SortableHeader column="vaccines" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                Vacunas
            </SortableHeader>
            <SortableHeader column="medications" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                Medicamentos
            </SortableHeader>
            <SortableHeader column="updated_at" currentSort={sortColumn} direction={sortDirection} onSort={onSort}>
                Última Actualización
            </SortableHeader>
            <TableHead className="w-[120px] text-center">Acciones</TableHead>
        </TableRow>
    );
}