import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { MedicalRecord } from '../../../../types/medical-record.type';

interface MedicalRecordsFilterProps {
    searchFilter: string;
    setSearchFilter: (value: string) => void;
    bloodTypeFilter: string;
    setBloodTypeFilter: (value: string) => void;
    epsFilter: string;
    setEpsFilter: (value: string) => void;
    allergiesFilter: string;
    setAllergiesFilter: (value: string) => void;
    records: MedicalRecord[];
}

export default function MedicalRecordsFilter({
    searchFilter,
    setSearchFilter,
    bloodTypeFilter,
    setBloodTypeFilter,
    epsFilter,
    setEpsFilter,
    allergiesFilter,
    setAllergiesFilter,
    records,
}: MedicalRecordsFilterProps) {
    const [isBloodTypeActive, setIsBloodTypeActive] = useState(false);
    const [isEpsActive, setIsEpsActive] = useState(false);
    const [isAllergiesActive, setIsAllergiesActive] = useState(false);

    // Extraer valores únicos de tipos de sangre
    const bloodTypes = useMemo(() => {
        const unique = [...new Set(records.map((r) => r.blood_type))];
        return unique.sort();
    }, [records]);

    // Extraer valores únicos de EPS
    const epsList = useMemo(() => {
        const unique = [...new Set(records.map((r) => r.eps))];
        return unique.sort();
    }, [records]);

    // Limpiar todos los filtros
    const clearFilters = () => {
        setSearchFilter("");
        setBloodTypeFilter("");
        setEpsFilter("");
        setAllergiesFilter("");
    };

    // Verificar si hay filtros activos
    const hasActiveFilters = searchFilter || bloodTypeFilter || epsFilter || allergiesFilter;

    return (
        <div className="space-y-3 mb-4">
            <div className="flex gap-3 flex-wrap">
                {/* Búsqueda por nombre */}
                <Input
                    type="text"
                    placeholder="Buscar por nombre del integrante..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="flex-1 min-w-[250px] border-primary"
                />

                {/* Filtro por tipo de sangre */}
                <DropdownMenu onOpenChange={setIsBloodTypeActive}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={bloodTypeFilter ? "primary" : "outline"}
                            className="min-w-[180px] justify-between"
                        >
                            <span className="truncate">
                                {bloodTypeFilter || "Tipo de sangre"}
                            </span>
                            {isBloodTypeActive ? (
                                <ChevronUp className="h-4 w-4 ml-2 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setBloodTypeFilter("")}
                        >
                            Todos los tipos
                        </DropdownMenuItem>
                        {bloodTypes.map((type) => (
                            <DropdownMenuItem
                                key={type}
                                className="cursor-pointer"
                                onSelect={() => setBloodTypeFilter(type)}
                            >
                                {type}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Filtro por EPS */}
                <DropdownMenu onOpenChange={setIsEpsActive}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={epsFilter ? "primary" : "outline"}
                            className="min-w-[180px] justify-between"
                        >
                            <span className="truncate">
                                {epsFilter || "EPS"}
                            </span>
                            {isEpsActive ? (
                                <ChevronUp className="h-4 w-4 ml-2 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setEpsFilter("")}
                        >
                            Todas las EPS
                        </DropdownMenuItem>
                        {epsList.map((eps) => (
                            <DropdownMenuItem
                                key={eps}
                                className="cursor-pointer"
                                onSelect={() => setEpsFilter(eps)}
                            >
                                {eps}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Filtro por alergias */}
                <DropdownMenu onOpenChange={setIsAllergiesActive}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={allergiesFilter ? "primary" : "outline"}
                            className="min-w-[150px] justify-between"
                        >
                            <span className="truncate">
                                {allergiesFilter === "yes"
                                    ? "Con alergias"
                                    : allergiesFilter === "no"
                                        ? "Sin alergias"
                                        : "Alergias"}
                            </span>
                            {isAllergiesActive ? (
                                <ChevronUp className="h-4 w-4 ml-2 flex-shrink-0" />
                            ) : (
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setAllergiesFilter("")}
                        >
                            Todos
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setAllergiesFilter("yes")}
                        >
                            Con alergias
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onSelect={() => setAllergiesFilter("no")}
                        >
                            Sin alergias
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Botón para limpiar filtros */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Limpiar
                    </Button>
                )}
            </div>
        </div>
    );
}