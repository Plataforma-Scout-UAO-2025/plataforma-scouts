import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil } from 'lucide-react';
import type { Member } from '../../types/member.type';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MembersTableColumnsProps {
  onViewDetails: (member: Member) => void;
  onEdit: (member: Member) => void;
}

export const createMembersTableColumns = ({
  onViewDetails,
  onEdit,
}: MembersTableColumnsProps): ColumnDef<Member>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'firstName',
    header: 'NOMBRE',
    cell: ({ row }) => <div className="font-medium">{row.getValue('firstName')}</div>,
  },
  {
    accessorKey: 'lastName',
    header: 'APELLIDOS',
    cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
  },
  {
    accessorKey: 'identification',
    header: 'IDENTIFICACIÓN',
    cell: ({ row }) => <div className="font-mono">{row.getValue('identification')}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: 'CREADO',
    cell: ({ row }) => {
      const rawDate = row.getValue('createdAt');
      if (typeof rawDate !== 'string') { // Validar que rawDate es una cadena antes de crear el objeto Date
        return <div className="text-sm">-</div>;
      }
      const date = new Date(rawDate);
      const isValidDate = !isNaN(date.getTime());
      return (
        <div className="text-sm">
          {isValidDate
            ? format(date, "d MMM yyyy h:mmaaa", { locale: es })
            : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'ESTADO',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge 
          variant={isActive ? 'default' : 'secondary'} 
          className={isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'rama',
    header: 'RAMAS',
    cell: ({ row }) => <div>{row.getValue('rama')}</div>,
  },
  {
    id: 'actions',
    header: 'ACCIONES',
    cell: ({ row }) => {
      const member = row.original;
      
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(member)}
            className="h-8 w-8 p-0 hover:bg-yellow-100 hover:text-yellow-800"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(member)}
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-800"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];