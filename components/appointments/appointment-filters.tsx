"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Filter, RotateCcw, X } from "lucide-react";
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
import { APPOINTMENT_TYPES_MAP } from "@/config/constants";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { DateRange } from "react-day-picker";

interface AppointmentFiltersProps<TData> {
  table: Table<TData>;
}

export function AppointmentFilters<TData>({
  table,
}: AppointmentFiltersProps<TData>) {
  const columnFilters = table.getState().columnFilters;
  const hasColumnFilters = columnFilters.length > 0;

  // Estado para el rango de fechas
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Helper para obtener valores de filtro de tipo
  const getTypeFilter = () =>
    (table.getColumn("type")?.getFilterValue() as string[]) || [];

  // Conteo de filtros activos (solo los del dropdown, no la fecha)
  const activeFilterCount = getTypeFilter().length;

  // Aplicar filtro de fecha
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    // Filtrar por la columna startTime (o la columna de fecha que uses)
    const dateColumn = table.getColumn("startTime");
    if (dateColumn) {
      if (range?.from) {
        dateColumn.setFilterValue(range);
      } else {
        dateColumn.setFilterValue(undefined);
      }
    }
  };

  // Limpiar todos los filtros incluyendo fechas
  const handleResetFilters = () => {
    table.resetColumnFilters();
    setDateRange(undefined);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Selector de Rango de Fechas */}
        <div className="relative">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-8 justify-start text-left font-normal w-[240px] pr-8",
                  !dateRange?.from && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd MMM", { locale: es })} -{" "}
                      {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                    </>
                  ) : (
                    format(dateRange.from, "dd MMM yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar fechas</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
          {dateRange?.from && (
            <Button
              variant="link"
              size="sm"
              className="absolute right-0 top-0 h-8 w-8 p-0"
              onClick={() => handleDateRangeChange(undefined)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpiar fechas</span>
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

            {/* Grupo: Tipo de Sesión */}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Tipo de Sesión</DropdownMenuLabel>
              {Object.entries(APPOINTMENT_TYPES_MAP).map(([key, label]) => {
                const filterValue = getTypeFilter();
                const isChecked = filterValue.includes(key);

                return (
                  <DropdownMenuCheckboxItem
                    key={key}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const column = table.getColumn("type");
                      const newValue = checked
                        ? [...filterValue, key]
                        : filterValue.filter((val) => val !== key);
                      column?.setFilterValue(
                        newValue.length ? newValue : undefined,
                      );
                    }}
                  >
                    {label}
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
                  disabled={!hasColumnFilters && !dateRange?.from}
                  onClick={handleResetFilters}
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
