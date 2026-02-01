"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Filter, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Tipos de convenio que queremos mostrar
const AGREEMENT_TYPES = [
  { value: "INSURANCE_COPAY", label: "Copago" },
  { value: "INSURANCE_PACKAGE", label: "Paquete" },
] as const;

interface PatientFiltersProps<TData> {
  table: Table<TData>;
  insurers: { id: string; name: string; isPrivate: boolean }[];
  doctors: { id: string; firstName: string; lastName: string }[];
}

export function PatientFilters<TData>({
  table,
  insurers,
  doctors,
}: PatientFiltersProps<TData>) {
  const globalFilter = (table.getState().globalFilter as string) ?? "";
  const columnFilters = table.getState().columnFilters;
  const hasColumnFilters = columnFilters.length > 0;
  const hasGlobalFilter = globalFilter.length > 0;

  // Ordenar aseguradoras: isPrivate = true primero
  const sortedInsurers = [...insurers].sort((a, b) => {
    if (a.isPrivate && !b.isPrivate) return -1;
    if (!a.isPrivate && b.isPrivate) return 1;
    return a.name.localeCompare(b.name);
  });

  // Helpers para obtener valores de filtro de cada columna
  const getTypeFilter = () =>
    (table.getColumn("type")?.getFilterValue() as string[]) || [];
  const getInsurerFilter = () =>
    (table.getColumn("insurer")?.getFilterValue() as string[]) || [];
  const getDoctorFilter = () =>
    (table.getColumn("treatingDoctor")?.getFilterValue() as string[]) || [];

  // Conteo de filtros activos
  const activeFilterCount =
    getTypeFilter().length +
    getInsurerFilter().length +
    getDoctorFilter().length;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Búsqueda Global + Botón Reset */}
        <div className="relative">
          <Input
            placeholder="Buscar pacientes..."
            value={globalFilter}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px] pr-8"
          />
          {hasGlobalFilter && (
            <Button
              variant="link"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0"
              onClick={() => table.resetGlobalFilter()}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar búsqueda</span>
            </Button>
          )}
        </div>

        {/* Dropdown Unificado de Filtros */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="h-8 border-dashed relative"
            >
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 text-[9px] h-4 w-4 flex items-center justify-center rounded-full"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {/* Título principal */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-base font-semibold">
                Filtros
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Grupo 1: Aseguradora (primero, ordenado por isPrivate) */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aseguradora</DropdownMenuLabel>
              {sortedInsurers.map((insurer) => {
                const filterValue = getInsurerFilter();
                const isChecked = filterValue.includes(insurer.name);

                return (
                  <DropdownMenuCheckboxItem
                    key={insurer.id}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const column = table.getColumn("insurer");
                      const newValue = checked
                        ? [...filterValue, insurer.name]
                        : filterValue.filter((val) => val !== insurer.name);
                      column?.setFilterValue(
                        newValue.length ? newValue : undefined,
                      );
                    }}
                  >
                    {insurer.name}
                    {insurer.isPrivate && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Particular
                      </span>
                    )}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Grupo 2: Tipo de Convenio (solo INSURANCE_COPAY y INSURANCE_PACKAGE) */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tipo de Convenio</DropdownMenuLabel>
              {AGREEMENT_TYPES.map((type) => {
                const filterValue = getTypeFilter();
                const isChecked = filterValue.includes(type.value);

                return (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const column = table.getColumn("type");
                      const newValue = checked
                        ? [...filterValue, type.value]
                        : filterValue.filter((val) => val !== type.value);
                      column?.setFilterValue(
                        newValue.length ? newValue : undefined,
                      );
                    }}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>

            {/* Grupo 3: Médico Tratante (solo si hay más de 1 doctor) */}
            {doctors.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Médico Tratante</DropdownMenuLabel>
                  {doctors.map((doctor) => {
                    const fullName = `${doctor.firstName} ${doctor.lastName}`;
                    const filterValue = getDoctorFilter();
                    const isChecked = filterValue.includes(fullName);

                    return (
                      <DropdownMenuCheckboxItem
                        key={doctor.id}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const column = table.getColumn("treatingDoctor");
                          const newValue = checked
                            ? [...filterValue, fullName]
                            : filterValue.filter((val) => val !== fullName);
                          column?.setFilterValue(
                            newValue.length ? newValue : undefined,
                          );
                        }}
                      >
                        {fullName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />

            {/* Botón Reiniciar Filtros */}
            <DropdownMenuGroup>
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!hasColumnFilters}
                  onClick={() => table.resetColumnFilters()}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reiniciar Filtros
                </Button>
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
