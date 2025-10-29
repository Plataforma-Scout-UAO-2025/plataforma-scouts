"use client";

import { useState } from 'react';
import { Table, TableBody, TableHeader } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MedicalRecord, MedicalRecordsTableProps } from '../../../../types/medical-record.type';
import { MedicalTableHeaders } from './MedicalTableHeader';
import { MedicalTableRow } from './MedicalTableRow';
import { MedicalTablePagination } from './MedicalTablePagination';
import { MedicalRecordDialog } from './MedicalRecordDialog';
import { ExportMedicalRecordModal } from './ExportMedicalRecordModal'; // ← Nuevo import

type SortColumn = 'member_name' | 'blood_type' | 'eps' | 'allergies' | 'vaccines' | 'medications' | 'updated_at';
type SortDirection = 'asc' | 'desc';

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          Cargando registros médicos...
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-muted-foreground">
          No hay registros médicos disponibles
        </div>
      </CardContent>
    </Card>
  );
}

export default function MedicalRecordsTable({
  records,
  onEdit,
  isLoading = false
}: MedicalRecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [recordToExport, setRecordToExport] = useState<MedicalRecord | null>(null); // ← Nuevo estado
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false); // ← Nuevo estado
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState<SortColumn>('member_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const handleExportClick = (record: MedicalRecord) => { // ← Nuevo handler
    setRecordToExport(record);
    setExportDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Lógica de ordenamiento y paginación (igual que antes)
  const sortedRecords = [...records].sort((a, b) => {
    let compareResult = 0;
    const hasContent = (text: string) => text && text.trim().length > 0;

    switch (sortColumn) {
      case 'member_name':
        compareResult = a.member_name.localeCompare(b.member_name, 'es-ES');
        break;
      case 'blood_type':
        compareResult = a.blood_type.localeCompare(b.blood_type, 'es-ES');
        break;
      case 'eps':
        compareResult = a.eps.localeCompare(b.eps, 'es-ES');
        break;
      case 'allergies':
        compareResult = hasContent(a.allergies) === hasContent(b.allergies)
          ? 0
          : hasContent(a.allergies) ? -1 : 1;
        break;
      case 'vaccines':
        compareResult = a.vaccines_detail.length - b.vaccines_detail.length;
        break;
      case 'medications':
        compareResult = a.medications_detail.length - b.medications_detail.length;
        break;
      case 'updated_at':
        compareResult = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        break;
      default:
        compareResult = 0;
    }

    return sortDirection === 'asc' ? compareResult : -compareResult;
  });

  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedRecords.length);
  const currentRecords = sortedRecords.slice(startIndex, endIndex);

  if (isLoading) return <LoadingState />;
  if (records.length === 0) return <EmptyState />;

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{endIndex} de {records.length} registros
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <MedicalTableHeaders
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
              />
            </TableHeader>

            <TableBody>
              {currentRecords.map((record) => (
                <MedicalTableRow
                  key={record.id}
                  record={record}
                  onView={handleView}
                  onEdit={onEdit}
                  onExport={handleExportClick} // ← Pasamos el nuevo handler
                />
              ))}
            </TableBody>
          </Table>

          <MedicalTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>

      <MedicalRecordDialog
        record={selectedRecord}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Nuevo Modal de Exportar */}
      <ExportMedicalRecordModal
        record={recordToExport}
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
      />
    </>
  );
}