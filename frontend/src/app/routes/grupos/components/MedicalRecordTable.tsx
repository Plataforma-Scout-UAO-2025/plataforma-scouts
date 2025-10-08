import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Eye,
  Edit,
  MoreVertical,
  User,
  Droplets,
  Pill,
  Shield,
  AlertTriangle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import type { MedicalRecord, MedicalRecordsTableProps } from '../types/medical-record';

export default function MedicalRecordsTable({
  records,
  onEdit,
  isLoading = false
}: MedicalRecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  // ESTADOS PARA PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const hasAllergies = (allergies: string) => {
    return allergies && allergies.trim().length > 0;
  };

  const hasChronicDiseases = (diseases: string) => {
    return diseases && diseases.trim().length > 0;
  };

  // LÓGICA DE PAGINACIÓN
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRecords = records.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // GENERAR RANGO DE PÁGINAS PARA MOSTRAR
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (isLoading) {
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

  if (records.length === 0) {
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

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, records.length)} de {records.length} registros
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Integrante</TableHead>
                <TableHead>Tipo Sangre</TableHead>
                <TableHead>EPS</TableHead>
                <TableHead>Alergias</TableHead>
                <TableHead>Vacunas</TableHead>
                <TableHead>Medicamentos</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="w-[80px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((record) => (
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
                    {hasAllergies(record.allergies) ? (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(record)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                {/* BOTÓN PRIMERA PÁGINA */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* BOTÓN PÁGINA ANTERIOR */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* NUMEROS DE PÁGINA */}
                <div className="flex space-x-1">
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                {/* BOTÓN PÁGINA SIGUIENTE */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* BOTÓN ÚLTIMA PÁGINA */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Médica - {selectedRecord.member_name}
                </DialogTitle>
                <DialogDescription>
                  Detalles completos del registro médico
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Información Básica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tipo de Sangre</Label>
                      <p className="text-sm">{selectedRecord.blood_type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">EPS</Label>
                      <p className="text-sm">{selectedRecord.eps}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Información Médica
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <Label className="text-sm font-medium">Alergias</Label>
                      <p className="text-sm">
                        {hasAllergies(selectedRecord.allergies)
                          ? selectedRecord.allergies
                          : 'Ninguna'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Enfermedades Crónicas</Label>
                      <p className="text-sm">
                        {hasChronicDiseases(selectedRecord.chronic_diseases)
                          ? selectedRecord.chronic_diseases
                          : 'Ninguna'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Restricciones Físicas</Label>
                      <p className="text-sm">
                        {selectedRecord.physical_restrictions || 'Ninguna'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Antecedentes Quirúrgicos</Label>
                      <p className="text-sm">
                        {selectedRecord.surgical_history || 'Ninguno'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Vacunas ({selectedRecord.vaccines_detail.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecord.vaccines_detail.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRecord.vaccines_detail.map((vaccine, index) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <span className="text-sm font-medium">{vaccine.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(vaccine.date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay vacunas registradas</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Medicamentos ({selectedRecord.medications_detail.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedRecord.medications_detail.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRecord.medications_detail.map((med, index) => (
                          <div key={index} className="p-3 border rounded space-y-2">
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm">
                              <strong>Dosis:</strong> {med.dose}
                            </div>
                            <div className="text-sm">
                              <strong>Frecuencia:</strong> {med.frecuency}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay medicamentos registrados</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}>
      {children}
    </label>
  );
}