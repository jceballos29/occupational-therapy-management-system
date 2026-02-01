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

// Estados de autorización
const AUTHORIZATION_STATUSES = [
  { value: "ACTIVE", label: "Activa" },
  { value: "COMPLETED", label: "Completada" },
  { value: "EXPIRED", label: "Vencida" },
] as const;

interface AuthorizationFiltersProps<TData> {
  table: Table<TData>;
}

export function AuthorizationFilters<TData>({
  table,
}: AuthorizationFiltersProps<TData>) {
  const globalFilter = (table.getState().globalFilter as string) ?? "";
  const columnFilters = table.getState().columnFilters;
  const hasColumnFilters = columnFilters.length > 0;
  const hasGlobalFilter = globalFilter.length > 0;

  // Helper para obtener valores de filtro de estado
  const getStatusFilter = () =>
    (table.getColumn("status")?.getFilterValue() as string[]) || [];

  // Conteo de filtros activos
  const activeFilterCount = getStatusFilter().length;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Búsqueda Global + Botón Reset */}
        <div className="relative">
          <Input
            placeholder="Buscar autorizaciones..."
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

            {/* Grupo: Estado */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Estado</DropdownMenuLabel>
              {AUTHORIZATION_STATUSES.map((status) => {
                const filterValue = getStatusFilter();
                const isChecked = filterValue.includes(status.value);

                return (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const column = table.getColumn("status");
                      const newValue = checked
                        ? [...filterValue, status.value]
                        : filterValue.filter((val) => val !== status.value);
                      column?.setFilterValue(
                        newValue.length ? newValue : undefined,
                      );
                    }}
                  >
                    {status.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>

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
